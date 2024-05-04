import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import csv from "csv-parser";
import { Transform } from "stream";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

interface Row {
  embedding: string;
  rating: string;
}

function createLineRangeStream(startLine: number, endLine: number) {
  let currentLine = 0;
  return new Transform({
    transform(chunk, _, callback) {
      if (currentLine >= startLine && currentLine < endLine) {
        this.push(chunk);
      }
      currentLine++;
      if (currentLine >= endLine) {
        this.push(null);
      }
      callback();
    },
    objectMode: true,
  });
}

async function parseCSV(
  filePath: string,
  startLine: number,
  endLine: number
): Promise<Row[]> {
  return new Promise((resolve, reject) => {
    const rows: Row[] = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: "|" }))
      .pipe(createLineRangeStream(startLine, endLine))
      .on("data", (row) => {
        rows.push(row);
      })
      .on("error", (error) => {
        reject(error);
      })
      .on("end", () => {
        resolve(rows);
      });
  });
}

class AI {
  model: tf.Sequential;

  constructor() {
    this.model = this.compile();
  }

  compile() {
    const model = tf.sequential();

    // input layer
    model.add(
      tf.layers.dense({
        units: 3,
        inputShape: [1536],
      })
    );

    // output layer
    model.add(
      tf.layers.dense({
        units: 1,
        activation: "sigmoid",
      })
    );

    model.compile({
      loss: "binaryCrossentropy",
      optimizer: "sgd",
      metrics: ["accuracy"],
    });

    return model;
  }

  async train() {
    const data = await parseCSV("prepared_dataset.csv", 0, 45000);

    const converted = data.map((row) => ({
      embedding: JSON.parse(row.embedding),
      rating: Number(row.rating),
    }));

    const xsConverted = converted.map(({ embedding }) => embedding);

    const ysConverted = converted.map(({ rating }) => [rating]);

    const xs = tf.tensor2d(xsConverted);

    const ys = tf.tensor2d(ysConverted);

    await this.model.fit(xs, ys, {
      epochs: 250,
    });
  }

  async predict(text: string) {
    const stuff = await openai.embeddings.create({
      input: text,
      model: "text-embedding-3-small",
    });

    const vector = stuff.data[0].embedding;

    const example = tf.tensor2d([vector]);
    const prediction = this.model.predict(example);

    return prediction.dataSync()[0];
  }

  async save() {
    await this.model.save("file://./profanity-model");
  }
}

async function main() {
  const ai = new AI();
  await ai.train();
  const prediction = await ai.predict("hello world");
  console.log("Prediction:", prediction);
  await ai.save();
}

main();
