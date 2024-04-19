import * as tf from "@tensorflow/tfjs-node"
import fs from "fs"
import csv from "csv-parser"
import { Transform } from "stream"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
})

interface Row {
  embedding: string
  rating: string
}

function createLineRangeStream(startLine: number, endLine: number) {
  let currentLine = 0
  return new Transform({
    transform(chunk, _, callback) {
      if (currentLine >= startLine && currentLine < endLine) {
        this.push(chunk)
      }
      currentLine++
      if (currentLine >= endLine) {
        this.push(null)
      }
      callback()
    },
    objectMode: true,
  })
}

async function parseCSV(
  filePath: string,
  startLine: number,
  endLine: number
): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    const rows: Row[] = []

    fs.createReadStream(filePath)
      .pipe(csv({ separator: "|" }))
      .pipe(createLineRangeStream(startLine, endLine))
      .on("data", (row) => {
        rows.push(row)
      })
      .on("error", (error) => {
        reject(error)
      })
      .on("end", () => {
        resolve(rows)
      })
  })
}

class AI {
  compile() {
    const model = tf.sequential()

    // input layer
    model.add(
      tf.layers.dense({
        units: 3,
        inputShape: [1536],
      })
    )

    // output layer
    model.add(
      tf.layers.dense({
        units: 1,
        activation: "sigmoid",
      })
    )

    model.compile({
      loss: "binaryCrossentropy",
      optimizer: "sgd",
      metrics: ["accuracy"],
    })

    return model
  }

  async run() {
    const model = this.compile()

    const data = await parseCSV("prepared_dataset.csv", 0, 45000)

    const converted = data.map((row) => ({
      embedding: JSON.parse(row.embedding),
      rating: Number(row.rating),
    }))

    const xsConverted = converted.map(({ embedding }) => embedding)

    const ysConverted = converted.map(({ rating }) => [rating])

    console.log(xsConverted, ysConverted)

    const xs = tf.tensor2d(xsConverted)

    const ys = tf.tensor2d(ysConverted)

    await model.fit(xs, ys, {
      epochs: 250,
    })

    const testText = "hello world" // no flagging expected

    const stuff = await openai.embeddings.create({
      input: testText,
      model: "text-embedding-3-small",
    })

    const vector = stuff.data[0].embedding

    const example = tf.tensor2d([vector])
    const prediction = model.predict(example)

    // @ts-ignore
    prediction.print()

    await model.save("file://./profanity-model")
  }
}

const ai = new AI()
ai.run()
