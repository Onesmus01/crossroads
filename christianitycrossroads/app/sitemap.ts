import { MetadataRoute } from 'next'

const baseUrl = 'https://www.christianity-at-the-crossroads.com'

/* ---------------- FETCH BOOKS ---------------- */
async function getBooks() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/book/all-books`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) {
      console.error('Sitemap: Failed to fetch books', res.status)
      return []
    }

    const data = await res.json()
    return Array.isArray(data) ? data : data.books || data.data || []
  } catch (err) {
    console.error('Sitemap fetch error:', err)
    return []
  }
}

/* ---------------- SITEMAP ---------------- */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await getBooks()

  const staticLastMod = new Date('2026-05-29T00:00:00.000Z')

  const bookUrls: MetadataRoute.Sitemap = books
    .map((book: any) => {
      const id = book._id || book.id
      if (!id) return null

      const lastMod = book.updatedAt
        ? new Date(book.updatedAt)
        : book.createdAt
          ? new Date(book.createdAt)
          : staticLastMod

      // FIX: Next.js expects image objects with `url` key, not plain strings
      const images: { url: string; caption?: string }[] = []
      if (book.coverImage) images.push({ url: book.coverImage })
      if (book.thumbnail && book.thumbnail !== book.coverImage) {
        images.push({ url: book.thumbnail })
      }

      return {
        url: `${baseUrl}/bookDetails/${id}`,
        lastModified: lastMod,
        changeFrequency: 'monthly', // books rarely change; weekly wastes crawl budget
        priority: 0.8,
        images: images.length > 0 ? images : undefined,
      }
    })
    .filter(Boolean) as MetadataRoute.Sitemap

  return [
    {
      url: baseUrl,
      lastModified: staticLastMod,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/books`,
      lastModified: staticLastMod,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: staticLastMod,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: staticLastMod,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...bookUrls,
  ]
}