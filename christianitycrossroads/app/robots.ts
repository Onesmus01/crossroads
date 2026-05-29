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
          '/_next',
          '/_next/*',
          '/*.json$',
          '/*.xml$', // if you have alternate sitemaps
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