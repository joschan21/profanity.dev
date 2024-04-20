'use client'

import { checkProfanity } from '@/actions'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Icons } from './Icons'

const Demo = () => {
  const [message, setMessage] = useState<string>(
    'this is definitely not a swear word'
  )

  const { data, mutate, isPending, error } = useMutation({
    mutationKey: ['check-profanity'],
    mutationFn: checkProfanity,
    onSettled: (data) => {
      if (data && 'error' in data) {
        throw new Error(data.error)
      }
    },
  })

  const successData = data && !('error' in data) ? data : undefined

  return (
    <div className='flex flex-col gap-5 items-center'>
      <div className='relative w-full rounded-xl mt-12 bg-gray-900/5 p-4 ring-1 ring-inset ring-gray-900/10 lg:rounded-2xl'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-4'>
            <span className='inline-flex items-center rounded-md bg-zinc-700 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-blue-400/20'>
              POST
            </span>
            <div className='h-[20px] w-px bg-zinc-300' />
            <p className='break-all'>https://vector.profanity.dev</p>
          </div>
        </div>
        <div className='relative flex flex-col sm:flex-row items-center gap-2 mt-6 h-full sm:h-9'>
          <Input
            className='bg-white h-9'
            value={message}
            onChange={({ target }) => {
              setMessage(target.value)
            }}
          />
          <Button
            disabled={isPending}
            className='h-9 w-full sm:w-fit'
            onClick={() => mutate({ message })}>
            Profanity check
          </Button>
        </div>

        <div className='h-32 mt-4 rounded-lg border-2 border-dashed border-zinc-300 text-sm flex items-center justify-center'>
          {successData ? (
            <div className='flex flex-col items-center text-center'>
              <p className='font-bold'>
                {successData.score > 0.95 ? (
                  <span>
                    🚨🚨😱😱 OH GOD, VERY BIG PROFANITY DETECTED!! 🚨🚨😱😱{' '}
                  </span>
                ) : successData.score > 0.9 ? (
                  <span>🚨😱 BIG PROFANITY DETECTED!! 🚨😱 </span>
                ) : successData.score > 0.88 ? (
                  <span>🚨 PROFANITY DETECTED!! 🚨 </span>
                ) : successData.score >= 0.85 ? (
                  <span>😱 PRETTY SURE THIS IS A PROFANITY 😱</span>
                ) : successData.score < 0.85 ? (
                  <span>Crispy clean input, no profanities :)) 👍👍</span>
                ) : null}
              </p>

              <p className='text-sm text-zinc-700'>
                score (higher is worse): {successData.score.toFixed(3)}
              </p>
            </div>
          ) : (
            <p className='text-zinc-700'>Results will be shown here</p>
          )}
        </div>

        {error ? (
          <p className='text-red-600 text-sm mt-2'>
            <span className='font-semibold'>Error:</span> {error.message}
          </p>
        ) : null}
      </div>

      <div className='text-sm flex gap-2 items-center h-fit'>
        powered by <Icons.upstash className='w-20' />
      </div>
    </div>
  )
}

export default Demo
