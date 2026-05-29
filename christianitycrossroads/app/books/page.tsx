import type { Metadata } from 'next'
import BooksPageClient from './BooksPageClient'

const baseUrl = 'https://www.christianity-at-the-crossroads.com'

/* ---------------- FETCH FOR SCHEMA ---------------- */
async function getBooksForSchema() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/book/all-books`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return Array.isArray(data) ? data : data.books || data.data || []
  } catch {
    return []
  }
}

/* ---------------- SEO METADATA ---------------- */
export const metadata: Metadata = {
  title: 'Books',
  description:
    'Browse our complete library of Christian books, devotionals, and theological works. Discover bestsellers, new releases, and free faith-building resources.',

  metadataBase: new URL(baseUrl),

  alternates: {
    canonical: '/books',
  },

  openGraph: {
    title: 'Books | Christianity at the Crossroads',
    description:
      'Browse our complete library of Christian books, devotionals, and theological works.',
    url: '/books',
    siteName: 'Christianity at the Crossroads',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Christian Books Library',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Books | Christianity at the Crossroads',
    description:
      'Browse our complete library of Christian books, devotionals, and theological works.',
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

/* ---------------- PAGE ---------------- */
export default async function BooksPage() {
  const books = await getBooksForSchema()

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: 'Christian Books Library',
        url: `${baseUrl}/books`,
        description:
          'Browse our complete library of Christian books, devotionals, and theological works.',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: books
            .map((book: any, index: number) => {
              const id = book._id || book.id
              if (!id || !book.title) return null
              return {
                '@type': 'ListItem',
                position: index + 1,
                url: `${baseUrl}/bookDetails/${id}`,
                name: book.title,
                image: book.coverImage || undefined,
                author: book.author
                  ? { '@type': 'Person', name: book.author }
                  : undefined,
              }
            })
            .filter(Boolean),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Books',
            item: `${baseUrl}/books`,
          },
        ],
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BooksPageClient />
    </>
  )
}