import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { RootLayoutClient } from './layout-client'
import { ContextProvider } from '@/context/userContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import GoogleProvider from '@/components/GoogleProvider'
import { LogoutListener } from '@/components/LogoutListener'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
}

export const metadata: Metadata = {
  title: {
    default: 'Christianity at the Crossroads',
    template: '%s | Christianity at the Crossroads',
  },
  description:
    'Explore Christian books, teachings, and inspirational content that strengthens faith and spiritual growth.',
  metadataBase: new URL('https://www.christianity-at-the-crossroads.com'),

  openGraph: {
    title: 'Christianity at the Crossroads',
    description:
      'Explore Christian books, teachings, and inspirational content.',
    url: 'https://www.christianity-at-the-crossroads.com',
    siteName: 'Christianity at the Crossroads',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Christianity at the Crossroads',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Christianity at the Crossroads',
    description:
      'Explore Christian books, teachings, and inspirational content.',
    images: ['/og-default.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  verification: {
    // google: 'your-verification-code',
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        {/* Prevents theme flash before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('theme');
                  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = saved || (systemDark ? 'dark' : 'light');
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LogoutListener>
          <GoogleProvider>
            <ContextProvider>
              <Header />
              <RootLayoutClient>{children}</RootLayoutClient>
              <Footer />
              <Toaster position="top-right" />
            </ContextProvider>
          </GoogleProvider>
        </LogoutListener>
      </body>
    </html>
  )
}