import { Index } from '@upstash/vector'
import fs from 'fs'
import { createInterface } from 'readline'
import "dotenv/config"
import { basename, join } from 'path'

const index = new Index({
  url: process.env.VECTOR_URL,
  token: process.env.VECTOR_TOKEN,
})

const UPSERT_ROWS_BUFSZ = 100;

const DATASETS_DIR = 'training_data';
const datasets = fs.readdirSync(DATASETS_DIR);

type Language = string & { length: 3 };

/**
 * Send (upsert) a packet to the index, given a namespace and an id offset
 * @param namespace The vector namespace where the data should be loaded
 * @param rows The actual string rows
 * @param offset The id offset (defaults to 0)
 * @returns The index upsert promise
 */
function send(namespace: string, rows: string[], offset = 0) {

  // build the packet with proper type checking
  const packet: Parameters<Index["upsert"]>[0] = rows.map((row, i) => ({
    id: offset + i,
    data: row,
    metadata: { text: row }
  }));

  // return the upsert promise (no need to async/await)
  return index.upsert(packet, { namespace });

}

/**
 * Seed the index from a ReadStream, using a language as namespace
 * @param input An fs ReadStream to use as source input
 * @param language The language of the content read from the source input
 */
async function seed(input: fs.ReadStream, language: Language) {

  console.info(`> Seeding ${language} namespace`)

  // create a readline interface to read file line-by-line
  const rl = createInterface({ input, crlfDelay: Infinity });

  // the entry id offset
  var offset = 0;

  // the rows buffer
  var rows: string[] = [];

  // iterate all lines of the stream/readline interface
  for await (const line of rl) {

    // if we have BUFSZ entries after pushing
    if (UPSERT_ROWS_BUFSZ == rows.push(line)) {

      // send the rows buffer
      await send(language, rows, offset);

      // empty the rows buffer
      rows = [];

      // increment id offset by BUFSZ
      offset += UPSERT_ROWS_BUFSZ;

    }

  }

  // send leftover lines
  await send(language, rows, offset);

}

for (const dataset of datasets) {
  const filepath = join(DATASETS_DIR, dataset);
  const language = basename(filepath, '.csv') as Language;
  const stream = fs.createReadStream(filepath);
  seed(stream, language);
}