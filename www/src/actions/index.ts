'use server'

import { redis } from '@/lib/redis'

type APIError = {
  error: string
}

type APISuccess = {
  isProfanity: boolean
  score: number
  flaggedFor: string[] | undefined
}

export const checkProfanity = async ({ message }: { message: string }) => {
  try {
    if (message.trim().split(/\s+/).length <= 1) {
      return { error: 'Please enter a longer text, at least 2 words.' }
    }

    if (message.trim().split(/\s+/).length > 35) {
      return {
        error:
          "Due to a current Cloudflare limit, we can only scan texts up to 35 words. I'm working on removing this limit.",
      }
    }

    const res = await fetch(process.env.HONO_APP_URL ?? 'https://vector.profanity.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })

    await redis.incr('served-requests')

    const json = await res.json()

    if (!res.ok) {
      const { error } = json as APIError
      return { error }
    }

    return json as APISuccess
  } catch (err) {
    return { error: 'Something went wrong, please try again.' }
  }
}
