import { Index, QueryResult, Vector } from '@upstash/vector'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

const semanticSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 25,
  separators: [' '],
  chunkOverlap: 8,
})

// there is bias in the underlying open-source embedding models
// so these are flagged inappropriately
const WHITELIST = ['black', 'swear']
const PROFANITY_WORD_THRESHOLD = 0.95
const PROFANITY_SEMANTIC_THRESHOLD = 0.86

type Environment = {
  VECTOR_URL: string
  VECTOR_TOKEN: string
}

const app = new Hono()

app.use(cors())

type PositiveResponse = {
  isProfanity: true;
  score: number;
  flaggedFor: string;
  languages: string[];
}

type NegativeResponse = {
  isProfanity: false;
  score: number;
  languages: string[];
}

app.post('/', async (c) => {

  // check for JSON content
  // TODO: consider form-urlencoded requests too
  if (c.req.header('Content-Type') !== 'application/json') {
    return c.json({ error: 'JSON body expected.' }, { status: 406 })
  }

  try {
    const { VECTOR_TOKEN, VECTOR_URL } = env<Environment>(c)

    const index = new Index({
      url: VECTOR_URL,
      token: VECTOR_TOKEN,
      cache: false, // disable needed for cf worker deployment
    })

    // obtain the actual request message and languages
    const body = await c.req.json()
    let { message, languages = ['eng'] } = body as {
      message?: string,
      languages?: string[]
    }

    // disallow empty messages
    if (!message) {
      return c.json({ error: 'Message argument is required.' }, { status: 400 })
    }

    // this is because of the cloudflare worker sub-request limit
    if (message.split(/\s/).length > 35 || message.length > 1000) {
      return c.json(
        {
          error:
            'Due to temporary cloudflare limits, a message can only be up to 35 words or 1000 characters.',
        },
        { status: 413 }
      )
    }

    // check if message contains profanity in provided languages
    const result = await checkProfanity(index, message, languages);
    return c.json(result);

  } catch (err) {

    // print error to console
    console.error(err)

    // return error to client
    return c.json(
      { error: 'Something went wrong.', err: JSON.stringify(err) },
      { status: 500 }
    )

  }

})

type FlagReason = {
  score: number;
  text: string;
  language?: string;
};

// main function used to check for profanities
async function checkProfanity(index: Index, message: string, languages: string[])
  : Promise<PositiveResponse | NegativeResponse> {

  message = message
    // split on all whitespaces (one or more - doesn't matter)
    .split(/\s/)
    // remove whitelisted words
    // TODO: create language specific whitelists
    .filter((word) => !WHITELIST.includes(word.toLowerCase()))
    // join all words back to the full "sentence"
    .join(' ')

  const sources = [
    { chunks: splitTextIntoSemantics(message), threshold: PROFANITY_SEMANTIC_THRESHOLD },
    { chunks: splitTextIntoWords(message), threshold: PROFANITY_WORD_THRESHOLD }
  ];

  // a set of flags
  const flags = new Set<FlagReason>();

  const vectorRes = (await parallelMap(languages, language =>
    parallelMap(sources, source =>
      parallelMap(source.chunks, async chunk => {

        // actual query to upstash
        const [ vector ] = await query(index, chunk, language);

        // check vector doesn't exceed source threshold
        if (vector && vector.score > source.threshold) {
          // flag
          flags.add({
            score: vector.score,
            text: vector.metadata!.text as string,
            language
          })
        }

        return vector!;

      })
    )
  )).flat(2)

  // if at least one flag is present it's profanity
  const isProfanity = flags.size > 0

  // get most profane flag/vector
  const sorted = (isProfanity ? [...flags] : vectorRes)
    .sort((a, b) => b.score - a.score)[0]

  return isProfanity
    ? { isProfanity, score: sorted?.score!, flaggedFor: (sorted as FlagReason)?.text, languages }
    : { isProfanity, score: sorted?.score!, languages }

}

function splitTextIntoWords(text: string): string[] {
  return text.split(/\s/)
}

async function splitTextIntoSemantics(text: string): Promise<string[]> {
  if (text.split(/\s/).length === 1) return [] // no semantics for single words
  const documents = await semanticSplitter.createDocuments([text])
  const chunks = documents.map((chunk) => chunk.pageContent)
  return chunks
}

// helper function to iterate over an array in a parallel/async fashion
const parallelMap = async <T, U>(
  array: T[] | Promise<T[]>,
  callback: (value: T, index: number, array: T[]) => Promise<U>
) => await Promise.all((await array).map(callback));

function query(index: Index, data: string, namespace: string) {
  // metadata includes the raw source dataset text, useful for flagging
  return index.query({ topK: 1, data, includeMetadata: true }, { namespace })
}

export default app
