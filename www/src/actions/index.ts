'use server'

import { redis } from '@/lib/redis'

type APIError = {
  error: string
}

type APISuccess = {
  isProfanity: boolean
  score: number
  flaggedFor: string[] | undefined
  latency: number
}

export const checkProfanity = async ({ message }: { message: string }) => {
  try {
    const startCheckpoint = Date.now();

    if (message.trim().split(/\s+/).length <= 1) {
      return { error: 'Please enter a longer text, at least 2 words.' }
    }

    const res = await fetch('https://vector.profanity.dev', {
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

    const endCheckpoint = Date.now()

    json.latency = endCheckpoint - startCheckpoint

    return json as APISuccess
  } catch (err) {
    return { error: 'Something went wrong, please try again.' }
  }
}
