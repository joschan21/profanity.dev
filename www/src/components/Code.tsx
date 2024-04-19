'use client'

import { cn } from '@/lib/utils'
import { Highlight, themes } from 'prism-react-renderer'

const Code = ({ code }: { code: string }) => {
  return (
    <Highlight theme={themes.vsDark} code={code} language='tsx'>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre style={style} className={cn(className, 'w-fit')}>
          {tokens.map((line, i) => {
            const { key, ...rest } = getLineProps({ line, key: i })
            return (
              <div key={i} style={{ position: 'relative' }} {...rest}>
                <span className='text-zinc-500 select-none pr-8 '>{i + 1}</span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            )
          })}
        </pre>
      )}
    </Highlight>
  )
}

export default Code
