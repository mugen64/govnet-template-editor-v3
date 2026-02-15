import type { Metadata } from 'next'
import { Nunito_Sans, Noto_Sans } from 'next/font/google'

import './globals.css'

const notoSans = Noto_Sans({variable:'--font-sans'});

const nunitoSans = Nunito_Sans({ subsets: ['latin'], variable: '--font-nunito-sans' })

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={notoSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
