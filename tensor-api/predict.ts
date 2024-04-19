import * as tf from "@tensorflow/tfjs"
import { Hono } from "hono"
import { env } from "hono/adapter"
import OpenAI from "openai"

const app = new Hono()

app.post("/", async (c) => {
  const { OPENAI_KEY } = env<{ OPENAI_KEY: string }>(c)
  const openai = new OpenAI({ apiKey: OPENAI_KEY })

  const modelUrl =
    "https://profanity-tensor-model.s3.eu-central-1.amazonaws.com/model.json"

  try {
    const model = await tf.loadLayersModel(modelUrl)

    const body = await c.req.json()
    const { message } = body

    const openaiRes = await openai.embeddings.create({
      input: message,
      model: "text-embedding-3-small",
    })

    const vector = openaiRes.data[0].embedding

    const input = tf.tensor2d([vector])
    const prediction = model.predict(input)

    let output: tf.Tensor<tf.Rank>

    if (Array.isArray(prediction)) {
      output = prediction[0]
    } else {
      output = prediction
    }

    const outputData = await output.data()

    return c.json({
      prediction: outputData[0],
      note: "1 is very toxic/profane, 0 is not profane at all",
    })
  } catch (err) {
    return c.json({ error: JSON.stringify(err) })
  }
})

export default app
