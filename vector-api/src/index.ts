import { Index } from '@upstash/vector'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'

// there is bias in the underlying open-source embedding models
// so these are flagged inappropriately
const WHITELIST = ['black', 'swear', 'mom', 'mum', 'mother', 'your']
const PROFANITY_THRESHOLD = 0.86

type Environment = {
  VECTOR_URL: string
  VECTOR_TOKEN: string
}

const app = new Hono()

app.use(cors())

app.post('/', async (c) => {
  if (c.req.header('Content-Type') !== 'application/json') {
    return c.json({ error: 'JSON body expected.' }, { status: 400 })
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

    message = message
      .split(' ')
      .filter((word) => !WHITELIST.includes(word))
      .join(' ')

    const semanticChunks = splitTextIntoChunks(message, 4) // for larger context
    const wordChunks = splitTextIntoChunks(message, 1) // for similar swear words

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

    return c.json({ error: 'Something went wrong.' }, { status: 500 })
  }
})

function splitTextIntoChunks(text: string, wordsPerChunk: number): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    let nextIndex = i + wordsPerChunk

    if (nextIndex > words.length && i > 0 && words.length - i < 2) {
      chunks[chunks.length - 1] = words
        .slice(i - wordsPerChunk, words.length)
        .join(' ')
      break
    }

    const chunk = words.slice(i, nextIndex).join(' ')
    chunks.push(chunk)
  }

  return chunks
}

export default app
