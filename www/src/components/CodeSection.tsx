"use client"

import Code from './Code'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

const codeBlock = `const res = await fetch('https://vector.profanity.dev', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message }),
})`

const CodeSection = () => {
  return (
    <ScrollArea className='relative'>
      <Code code={codeBlock} />

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export default CodeSection
