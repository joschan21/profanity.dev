import { Index } from '@upstash/vector'
import { Hono } from 'hono'
import { env } from 'hono/adapter'
import { cors } from 'hono/cors'

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

    const chunks = splitTextIntoChunks(message, 3)

    // due to multiple chunking approaches, prevent duplicate flagging
    const flaggedFor = new Set()

    const idk = await Promise.all(
      chunks.map(async (chunk) => {
        const [vector] = await index.query({
          topK: 1,
          data: chunk,
          includeMetadata: true,
        })

        if (vector && vector.score > PROFANITY_THRESHOLD) {
          flaggedFor.add(vector.metadata!.text)
        }

        return vector!
      })
    )

    const mostProfaneChunk = idk.sort((a, b) =>
      a.score > b.score ? -1 : 1
    )[0]!

    if (mostProfaneChunk.score > PROFANITY_THRESHOLD) {
      return c.json({
        isProfanity: mostProfaneChunk.score > PROFANITY_THRESHOLD,
        score: mostProfaneChunk.score,
        flaggedFor: Array.from(flaggedFor),
      })
    } else {
      return c.json({
        isProfanity: mostProfaneChunk.score > PROFANITY_THRESHOLD,
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
