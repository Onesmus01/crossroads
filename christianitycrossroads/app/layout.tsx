import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'

import { RootLayoutClient } from './layout-client'
import { ContextProvider } from '@/context/userContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

import { Toaster } from 'react-hot-toast'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

/* ---------------- VIEWPORT ---------------- */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/* ---------------- SEO METADATA ---------------- */
export const metadata: Metadata = {
  title: {
    default: 'Christianity at the Crossroads',
    template: '%s | Christianity at the Crossroads',
  },

  description:
    'Explore Christian books, teachings, and inspirational content that strengthens faith and spiritual growth.',

  metadataBase: new URL('https://www.christianity-at-the-crossroads.com'),

  /* ✅ CANONICAL FIX */
  alternates: {
    canonical: 'https://www.christianity-at-the-crossroads.com',
  },

  openGraph: {
    title: 'Christianity at the Crossroads',
    description:
      'Explore Christian books, teachings, and inspirational content.',
    url: 'https://www.christianity-at-the-crossroads.com',
    siteName: 'Christianity at the Crossroads',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Christianity at the Crossroads',
    description:
      'Explore Christian books, teachings, and inspirational content.',
  },

  robots: {
    index: true,
    follow: true,
  },
}

/* ---------------- ROOT LAYOUT ---------------- */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ContextProvider>
          <Header />

          <RootLayoutClient>
            {children}
          </RootLayoutClient>

          <Footer />
          <Toaster position="top-right" />
        </ContextProvider>
      </body>
    </html>
  )
}