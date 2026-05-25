import { type MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.christianitycrossroads.com'; // Change this to your actual domain in production

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/*'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: ['/admin/*'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}