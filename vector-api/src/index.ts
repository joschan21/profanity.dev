import { Index } from '@upstash/vector'
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
const PROFANITY_THRESHOLD = 0.86

type Environment = {
  VECTOR_URL: string
  VECTOR_TOKEN: string
}

const app = new Hono()

app.use(cors())

app.post('/', async (c) => {
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

    const body = await c.req.json()
    let { message } = body as { message: string }

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

    message = message
      .split(/\s/)
      .filter((word) => !WHITELIST.includes(word.toLowerCase()))
      .join(' ')

    const [semanticChunks, wordChunks] = await Promise.all([
      splitTextIntoSemantics(message),
      splitTextIntoWords(message),
    ])

    const flaggedFor = new Set<{ score: number; text: string }>()

    const vectorRes = await Promise.all([
      // this additional step adds slight latency but improves output on long text massively
      ...wordChunks.map(async (wordChunk) => {
        const [vector] = await index.query({
          topK: 1,
          data: wordChunk,
          includeMetadata: true,
        })

        if (vector && vector.score > 0.95) {
          flaggedFor.add({
            text: vector.metadata!.text as string,
            score: vector.score,
          })
        }

        return { score: 0 }
      }),
      ...semanticChunks.map(async (semanticChunk) => {
        const [vector] = await index.query({
          topK: 1,
          data: semanticChunk,
          includeMetadata: true,
        })

        if (vector && vector.score > PROFANITY_THRESHOLD) {
          flaggedFor.add({
            text: vector.metadata!.text as string,
            score: vector.score,
          })
        }

        return vector!
      }),
    ])

    if (flaggedFor.size > 0) {
      const sorted = Array.from(flaggedFor).sort((a, b) =>
        a.score > b.score ? -1 : 1
      )[0]
      return c.json({
        isProfanity: true,
        score: sorted?.score,
        flaggedFor: sorted?.text,
      })
    } else {
      const mostProfaneChunk = vectorRes.sort((a, b) =>
        a.score > b.score ? -1 : 1
      )[0]!

      return c.json({
        isProfanity: false,
        score: mostProfaneChunk.score,
      })
    }
  } catch (err) {
    console.error(err)

    return c.json(
      { error: 'Something went wrong.', err: JSON.stringify(err) },
      { status: 500 }
    )
  }
})

function splitTextIntoWords(text: string): string[] {
  return text.split(/\s/)
}

async function splitTextIntoSemantics(text: string): Promise<string[]> {
  if (text.split(/\s/).length === 1) return [] // no semantics for single words
  const documents = await semanticSplitter.createDocuments([text])
  const chunks = documents.map((chunk) => chunk.pageContent)
  return chunks
}

export default app
