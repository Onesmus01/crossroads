import type { Metadata } from 'next'

import { Header } from '@/components/Header'
import Hero from '@/components/Hero'
import { BooksSection } from '@/components/BooksSection'
import { Footer } from '@/components/Footer'

/* ---------------- BASE URL ---------------- */
const baseUrl = 'https://www.christianity-at-the-crossroads.com'

/* ---------------- SEO METADATA ---------------- */
export const metadata: Metadata = {
  title: {
    default: 'Christianity at the Crossroads',
    template: '%s | Christianity at the Crossroads',
  },

  description:
    'Christian books, devotionals, teachings, and inspirational content designed to strengthen faith, encourage spiritual growth, and deepen your walk with God.',

  keywords: [
    'Christianity at the Crossroads',
    'Christian Books',
    'Bible Teachings',
    'Faith',
    'Devotionals',
    'Spiritual Growth',
    'Christian Inspiration',
  ],

  metadataBase: new URL(baseUrl),

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'Christianity at the Crossroads',
    description:
      'Discover Christian books, teachings, devotionals, and faith-based inspiration.',
    url: baseUrl,
    siteName: 'Christianity at the Crossroads',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
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
      'Christian books, devotionals, teachings, and inspirational content for spiritual growth.',
    images: [`${baseUrl}/og-image.jpg`],
  },

  robots: {
    index: true,
    follow: true,
  },
}

/* ---------------- STRUCTURED DATA ---------------- */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Christianity at the Crossroads',
      url: baseUrl,
      description:
        'Christian books, teachings, devotionals, and inspirational content.',
      publisher: {
        '@type': 'Organization',
        name: 'Christianity at the Crossroads',
        url: baseUrl,
      },
    },
    {
      '@type': 'Organization',
      name: 'Christianity at the Crossroads',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
    },
    {
      '@type': 'Blog',
      name: 'Christianity at the Crossroads Blog',
      url: `${baseUrl}/blog`,
      description:
        'Devotionals, teachings, and Christian inspiration for spiritual growth.',
    },
  ],
}

/* ---------------- HOME PAGE ---------------- */
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero />

        <div className="-mt-2 sm:-mt-4">
          <BooksSection
            title="Featured Christian Books"
            description="Devotionals and teachings for spiritual growth"
            variant="featured"
          />
        </div>
      </main>

      <Footer />

      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </div>
  )
}