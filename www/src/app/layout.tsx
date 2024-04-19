import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import type { Metadata } from 'next'
import { Recursive } from 'next/font/google'
import 'simplebar-react/dist/simplebar.min.css'
import './globals.css'

const recursive = Recursive({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fast, Open-Source Profanity API',
  description: 'A project made by JoshTriedCoding',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={recursive.className}>
        <Navbar />
        <Providers>{children}</Providers>
        <Footer />
      </body>
    </html>
  )
}
