export const metadata: Metadata = {
  title: 'Christianity at the Crossroads - Explore Faith and Community',
  description:
    'Discover inspiring Christian books, teachings, and faith-based inspiration to strengthen your spiritual journey.',

  keywords: [
    'Christianity at the Crossroads',
    'Faith',
    'Christian Books',
    'Spiritual Growth',
    'Bible Teachings',
  ],

  metadataBase: new URL('https://www.christianity-at-the-crossroads.com'),

  openGraph: {
    title: 'Christianity at the Crossroads - Explore Faith and Community',
    description:
      'Discover inspiring Christian books, teachings, and faith-based inspiration.',
    url: 'https://www.christianity-at-the-crossroads.com',
    siteName: 'Christianity at the Crossroads',
    type: 'website',
    images: [
      {
        url: 'https://www.christianity-at-the-crossroads.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Christianity at the Crossroads',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Christianity at the Crossroads - Faith & Inspiration',
    description:
      'Discover inspiring Christian books, teachings, and faith-based inspiration.',
    images: ['https://www.christianity-at-the-crossroads.com/twitter-image.jpg'],
  },

  robots: {
    index: true,
    follow: true,
  },
}