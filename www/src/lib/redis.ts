import { Redis } from '@upstash/redis'

const token = process.env.UPSTASH_REDIS_REST_TOKEN
const url = process.env.UPSTASH_REDIS_REST_URL

if(!url || !token) {
  throw new Error('missing the following environment variables: \nUPSTASH_REDIS_REST_URL=\nUPSTASH_REDIS_REST_TOKEN')
}

export const redis = new Redis({
  url,
  token
})
