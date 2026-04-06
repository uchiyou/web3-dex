import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Web3 DEX - Decentralized Exchange',
  description: 'Trade tokens with the best rates on our hybrid Order Book + AMM DEX',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-400 text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
