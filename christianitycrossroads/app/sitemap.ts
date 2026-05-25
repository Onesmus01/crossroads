import { MetadataRoute } from 'next'

const baseUrl = 'https://www.christianity-at-the-crossroads.com'

/* ---------------- FETCH BOOKS ---------------- */
async function getBooks() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/book/all-books`,
      { next: { revalidate: 86400 } } // cache 24h
    )

    if (!res.ok) return []

    const data = await res.json()

    return Array.isArray(data)
      ? data
      : data.books || data.data || []
  } catch (err) {
    console.error('Sitemap fetch error:', err)
    return []
  }
}

/* ---------------- SITEMAP ---------------- */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getBooks()

  const bookUrls: MetadataRoute.Sitemap = books
    .map((book: any) => {
      const id = book._id || book.id
      if (!id) return null

      return {
        url: `${baseUrl}/bookDetails/${id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })
    .filter(Boolean) as MetadataRoute.Sitemap

  return [
    /* HOME */
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },

    /* STATIC PAGES */
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },

    /* DYNAMIC BOOK PAGES */
    ...bookUrls,
  ]
}