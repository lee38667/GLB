import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import { Suspense } from 'react'

import Navbar from '@/components/Navbar'
import { Footer } from '@/components/layout/Footer'
import Providers from './providers'

import './globals.css'

const sans = Inter_Tight({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const display = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://giveloveback.netlify.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Give Love Back — Fashion as an act of care',
    template: '%s · Give Love Back',
  },
  description:
    'Give Love Back is a community-first clothing brand creating pieces that carry care, connection, and self-expression.',
  applicationName: 'Give Love Back',
  keywords: ['GLB', 'Give Love Back', 'clothing', 'Namibia fashion', 'streetwear'],
  authors: [{ name: 'Give Love Back' }],
  icons: {
    icon: '/assets/logo.png',
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
  openGraph: {
    title: 'Give Love Back',
    description: 'Community-first fashion & creative movement.',
    url: siteUrl,
    siteName: 'Give Love Back',
    images: [{ url: '/assets/logo.png', width: 512, height: 512, alt: 'GLB Logo' }],
    type: 'website',
    locale: 'en_NA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Give Love Back',
    description: 'Community-first fashion & creative movement.',
    images: ['/assets/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: '#F2EBDD',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        <Providers>
          <div className="site-shell relative flex min-h-screen flex-col overflow-x-hidden">
            <Suspense fallback={null}>
              <Navbar />
            </Suspense>
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
