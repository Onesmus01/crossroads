import { MetadataRoute } from 'next'

const baseUrl = 'https://www.christianity-at-the-crossroads.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/login',
          '/signup',
          '/cart',
          '/checkout',
          '/profile',
          '/profile/*',
          '/orders',
          '/orders/*',
          '/api',
          '/api/*',
          // REMOVED: '/_next' and '/_next/*' — blocks Google from rendering your pages
          // REMOVED: '/*.json$' — blocks structured data & API responses
          // REMOVED: '/*.xml$' — blocks sitemaps and alternate language feeds
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/bookDetails', '/books'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}