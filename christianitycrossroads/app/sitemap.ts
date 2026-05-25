import { type MetadataRoute } from 'next';

export default async function sitemap(): Promise<<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.christianitycrossroads.com';
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';

    let bookUrls: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${backendUrl}/book/all-books`, {
            next: { revalidate: 86400 },
        });
        
        if (res.ok) {
            const books = await res.json();
            const bookList = Array.isArray(books) ? books : books.data || books.books || [];
            
            bookUrls = bookList.map((book: any) => ({
                url: `${baseUrl}/books/${book._id?.toString() || book.id?.toString()}`,
                lastModified: new Date().toISOString(),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            })).filter((item: any) => item.url !== `${baseUrl}/books/undefined`);
        }
    } catch (error) {
        console.error('Failed to fetch books for sitemap:', error);
    }

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/books`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        ...bookUrls,
    ];
}