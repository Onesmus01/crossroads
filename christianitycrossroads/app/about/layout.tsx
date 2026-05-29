import type { Metadata } from 'next'

const baseUrl = 'https://www.christianity-at-the-crossroads.com'

export const metadata: Metadata = {
  title: 'About Reverend Vincent Mboya',
  description:
    'Meet Reverend Vincent Mboya — pastor, author, and teacher dedicated to spiritual growth through Christian books, devotionals, and inspirational teachings.',

  alternates: {
    canonical: '/about',
  },

  openGraph: {
    title: 'About Reverend Vincent Mboya | Christianity at the Crossroads',
    description:
      'Pastor, author & teacher with 15+ years in ministry and 12 published books. Discover the mission behind the message.',
    url: '/about',
    siteName: 'Christianity at the Crossroads',
    type: 'profile',
    locale: 'en_US',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Reverend Vincent Mboya — Pastor and Author',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'About Reverend Vincent Mboya | Christianity at the Crossroads',
    description:
      'Pastor, author & teacher with 15+ years in ministry and 12 published books.',
    images: ['/og-default.jpg'],
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

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Structured Data: Person + Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'ProfilePage',
                '@id': `${baseUrl}/about`,
                url: `${baseUrl}/about`,
                name: 'About Reverend Vincent Mboya',
                description:
                  'Pastor, author, and teacher dedicated to spiritual growth through Christian books and devotionals.',
                isPartOf: {
                  '@type': 'WebSite',
                  '@id': baseUrl,
                  name: 'Christianity at the Crossroads',
                  url: baseUrl,
                },
                mainEntity: {
                  '@type': 'Person',
                  name: 'Reverend Vincent Mboya',
                  url: `${baseUrl}/about`,
                  jobTitle: 'Pastor, Author & Teacher',
                  description:
                    'Dedicated servant of God with 15+ years in ministry and 12 published books.',
                  knowsAbout: [
                    'Christian Ministry',
                    'Biblical Teaching',
                    'Spiritual Growth',
                    'Pastoral Care',
                  ],
                  worksFor: {
                    '@type': 'Organization',
                    name: 'Christianity at the Crossroads',
                    url: baseUrl,
                  },
                  sameAs: [
                    // Add real social links when available:
                    // 'https://facebook.com/vincentmboya',
                    // 'https://instagram.com/vincentmboya',
                  ],
                  image: {
                    '@type': 'ImageObject',
                    url: `${baseUrl}/author-photo.jpg`,
                    caption: 'Reverend Vincent Mboya',
                  },
                },
                image: {
                  '@type': 'ImageObject',
                  url: `${baseUrl}/og-default.jpg`,
                  width: 1200,
                  height: 630,
                },
              },
              {
                '@type': 'Organization',
                name: 'Christianity at the Crossroads',
                url: baseUrl,
                logo: {
                  '@type': 'ImageObject',
                  url: `${baseUrl}/logo.png`,
                  width: 512,
                  height: 512,
                },
                sameAs: [
                  // Add social links when available
                ],
              },
            ],
          }),
        }}
      />
      {children}
    </>
  )
}