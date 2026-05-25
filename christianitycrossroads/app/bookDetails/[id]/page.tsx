
import BookDetailsClient from './BookDetailsClient'
import type { Metadata, Viewport } from 'next'

/* ---------------- VIEWPORT ---------------- */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/* ---------------- BASE URL ---------------- */
const baseUrl = 'https://www.christianity-at-the-crossroads.com'

/* ---------------- FETCH BOOK ---------------- */
async function getBook(id: string) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api'

  try {
    const res = await fetch(`${backendUrl}/book/book-details/${id}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return null

    const data = await res.json()
    return Array.isArray(data) ? data[0] : data.data || data
  } catch {
    return null
  }
}

/* ---------------- METADATA ---------------- */
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const { id } = params

  const book = await getBook(id)

  if (!book) {
    return {
      title: 'Book Not Found | Christianity at the Crossroads',
      description:
        'Browse Christian books, devotionals, and faith-based resources.',
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: `${baseUrl}/books`,
      },
      robots: {
        index: false,
        follow: true,
      },
    }
  }

  const title = `${book.title ?? 'Book'} | Christianity at the Crossroads`

  const description =
    book.description?.slice(0, 160) ||
    `Discover "${book.title}" by ${
      book.author || 'Unknown Author'
    } and explore Christian literature and devotionals.`

  const image = book.coverImage || book.image

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),

    alternates: {
      canonical: `${baseUrl}/books/${id}`,
    },

    openGraph: {
      title,
      description,
      url: `${baseUrl}/books/${id}`,
      siteName: 'Christianity at the Crossroads',
      type: 'article',
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: book.title,
            },
          ]
        : [],
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },

    robots: {
      index: true,
      follow: true,
    },
  }
}

/* ---------------- PAGE ---------------- */
export default async function BookDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const book = await getBook(params.id)

  const jsonLd = book
    ? {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: book.title,
        author: {
          '@type': 'Person',
          name: book.author || 'Unknown Author',
        },
        description: book.description,
        image: book.coverImage || book.image,
        isbn: book.isbn,
        numberOfPages: book.pages,
        inLanguage: book.language || 'English',
        publisher: {
          '@type': 'Organization',
          name: 'Christianity at the Crossroads',
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'KES',
          price: book.price?.toString() || '0',
          availability: 'https://schema.org/InStock',
          url: `${baseUrl}/books/${params.id}`,
        },
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      )}

      <BookDetailsClient bookId={params.id} />
    </>
  )
}