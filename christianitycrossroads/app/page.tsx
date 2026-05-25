import type { Metadata } from 'next'

import { Header } from '@/components/Header'
import Hero from '@/components/Hero'
import { BooksSection } from '@/components/BooksSection'
import { Footer } from '@/components/Footer'

/* ---------------- SEO METADATA ---------------- */
export const metadata: Metadata = {
  title: 'Christianity Crossroads - Explore Faith and Community',
  description:
    'Discover inspiring Christian books, teachings, and faith-based inspiration to strengthen your spiritual journey.',

  keywords: [
    'Christianity',
    'Faith',
    'Community',
    'Inspiration',
    'Spiritual Growth',
  ],

  metadataBase: new URL('https://christianitycrossroads.com'),

  openGraph: {
    title: 'Christianity Crossroads - Explore Faith and Community',
    description:
      'Discover inspiring Christian books, teachings, and faith-based inspiration.',
    url: 'https://christianitycrossroads.com',
    siteName: 'Christianity Crossroads',
    type: 'website',
    images: [
      {
        url: 'https://christianitycrossroads.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Christianity Crossroads',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Christianity Crossroads - Explore Faith and Community',
    description:
      'Discover inspiring Christian books, teachings, and faith-based inspiration.',
    images: ['https://christianitycrossroads.com/twitter-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
  },
}

/* ---------------- STRUCTURED DATA ---------------- */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Christianity Crossroads',
  url: 'https://christianitycrossroads.com',
  description:
    'Discover inspiring content, connect with fellow believers, and deepen your faith.',
  publisher: {
    '@type': 'Organization',
    name: 'Christianity Crossroads',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero />

        <div className="-mt-2 sm:-mt-4">
          <BooksSection
            title="Featured Books"
            description="Handpicked for you"
            variant="featured"
          />
        </div>
      </main>

      <Footer />

      {/* Structured Data (SEO JSON-LD) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </div>
  )
}