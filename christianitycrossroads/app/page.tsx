import type { Metadata } from 'next'

import { Header } from '@/components/Header'
import Hero from '@/components/Hero'
import { BooksSection } from '@/components/BooksSection'
import { Footer } from '@/components/Footer'
import FeaturesPage  from '@/components/FeaturesPage'
import  AnimateDriver  from '@/components/AnimateDriver'
/* ---------------- BASE URL (PRIMARY DOMAIN ONLY) ---------------- */
const baseUrl = 'https://www.christianity-at-the-crossroads.com'

/* ---------------- SEO METADATA ---------------- */
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: {
    default: 'Christianity at the Crossroads',
    template: '%s | Christianity at the Crossroads',
  },

  description:
    'Christian books, devotionals, teachings, and inspirational content to strengthen faith and support spiritual growth.',

  keywords: [
    'Christianity at the Crossroads',
    'Christian Books',
    'Bible Teachings',
    'Faith',
    'Devotionals',
    'Spiritual Growth',
    'Christian Inspiration',
  ],

  /* IMPORTANT: forces single canonical identity */
  alternates: {
    canonical: baseUrl,
  },

  /* ---------------- OPEN GRAPH ---------------- */
  openGraph: {
    title: 'Christianity at the Crossroads',
    description:
      'Discover Christian books, devotionals, teachings, and faith-based inspiration.',
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
  

  /* ---------------- TWITTER ---------------- */
  twitter: {
    card: 'summary_large_image',
    title: 'Christianity at the Crossroads',
    description:
      'Christian books, devotionals, teachings, and inspirational content for spiritual growth.',
    images: [`${baseUrl}/og-image.jpg`],
  },

  /* ---------------- ROBOTS (GOOGLE OPTIMIZED) ---------------- */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
}

/* ---------------- STRUCTURED DATA (SEO ENTITY BOOST) ---------------- */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'Christianity at the Crossroads',
      url: baseUrl,
      description:
        'Christian books, teachings, devotionals, and inspirational content.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?q={query}`,
        'query-input': 'required name=query',
      },
    },
    {
      '@type': 'Organization',
      name: 'Christianity at the Crossroads',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: [],
    },
  ],
}

/* ---------------- HOME PAGE ---------------- */
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      <main className="flex-1">
        <Hero />

        <div className="-mt-2 sm:-mt-4">
          <BooksSection
            title="Featured Christian Books"
            description="Devotionals and teachings for spiritual growth"
            variant="featured"
          />
        </div>
        {/* <AnimateDriver variant="pulse" className="my-12" height={4} width="100%" center /> */}
        <AnimateDriver
          variant="shimmer"
          color="custom"
          customFrom="#ff6b6b"
          customTo="#4ecdc4"
          height="2px"
          center
        />
        <FeaturesPage />
      </main>

      {/* JSON-LD SEO (GOOGLE UNDERSTANDING LAYER) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </div>
  )
}