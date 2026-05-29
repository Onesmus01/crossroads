import type { Metadata } from 'next'
import { Header } from '@/components/Header'
import Hero from '@/components/Hero'
import { BooksSection } from '@/components/BooksSection'
import { Footer } from '@/components/Footer'
import FeaturesPage from '@/components/FeaturesPage'
import AnimateDriver from '@/components/AnimateDriver'
import Conveyor from '@/components/Conveyor'

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

  // ✅ Homepage canonical is correct here — but NEVER copy this exact
  // `alternates: { canonical: baseUrl }` pattern to other pages.
  // Other pages must use their own path, e.g. `/books`, `/about`, etc.
  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'Christianity at the Crossroads',
    description:
      'Discover Christian books, devotionals, teachings, and faith-based inspiration.',
    url: '/',
    siteName: 'Christianity at the Crossroads',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg', // resolves via metadataBase
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
    images: ['/og-image.jpg'],
  },

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

/* ---------------- STRUCTURED DATA ---------------- */
function StructuredData() {
  const data = {
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
          // ✅ Fixed: Google expects this exact placeholder name
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/books?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        name: 'Christianity at the Crossroads',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        // Only include sameAs when you actually have social links:
        // sameAs: ['https://facebook.com/...', 'https://instagram.com/...'],
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

/* ---------------- HOME PAGE ---------------- */
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <Hero />
        <Conveyor speed={0.6} bookHeight={30} className="my-2" />

        <div className="-mt-8 sm:-mt-14 lg:-mt-20">
          <BooksSection
            title="Featured Christian Books"
            description="Devotionals and teachings for spiritual growth"
            variant="featured"
          />
        </div>

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

      <StructuredData />
    </div>
  )
}