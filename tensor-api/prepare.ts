import csv from "csv-parser"
import fs from "fs"
import { Transform } from "stream"
import { OpenAI } from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
})

const writeStream = fs.createWriteStream("prepared_dataset.csv", { flags: "a" })

interface Row {
  id: string
  comment_text: string
  toxic: string
  severe_toxic: string
  obscene: string
  threat: string
  insult: string
  identity_hate: string
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
      .pipe(csv({ separator: "," }))
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

const STEP = 250

const prepare = async () => {
  for (let i = 0; i < 45000; i += STEP) {
    const start = i
    const end = i + STEP

    const data = await parseCSV("raw_dataset.csv", start, end)

    data.forEach(async (row) => {
      const hate = Number(row.severe_toxic)
      const obscene = Number(row.obscene)
      const insult = Number(row.insult)
      const identity = Number(row.identity_hate)
      const threat = Number(row.threat)

      const isFlagged = hate || obscene || insult || identity || threat

      const stuff = await openai.embeddings.create({
        input: row.comment_text,
        model: "text-embedding-3-small",
      })

      const vector = stuff.data[0].embedding

      writeStream.write(`[${vector}]|${isFlagged ? 1 : 0}` + "\n")

      await new Promise((resolve) => setTimeout(resolve, 500))
    })
  }
}

prepare()
