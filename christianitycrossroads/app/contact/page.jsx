import  { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

const baseUrl = 'https://www.christianity-at-the-crossroads.com'

export const metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Christianity at the Crossroads for book inquiries, ministry events, speaking engagements, and prayer requests. Based in Nairobi, Kenya.',
  
  metadataBase: new URL(baseUrl),
  
  alternates: {
    canonical: '/contact',
  },

  openGraph: {
    title: 'Contact Us | Christianity at the Crossroads',
    description:
      'Reach out for book orders, ministry events, speaking engagements, or prayer requests.',
    url: '/contact',
    siteName: 'Christianity at the Crossroads',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Christianity at the Crossroads',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | Christianity at the Crossroads',
    description:
      'Reach out for book orders, ministry events, speaking engagements, or prayer requests.',
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

export default function ContactPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        name: 'Contact Us',
        url: `${baseUrl}/contact`,
        description:
          'Contact Christianity at the Crossroads for inquiries, events, and prayer requests.',
        mainEntity: {
          '@type': 'Organization',
          name: 'Christianity at the Crossroads',
          url: baseUrl,
          logo: `${baseUrl}/logo.png`,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+254-722-690-576',
            contactType: 'customer service',
            email: 'vincentmboya100@gmail.com',
            areaServed: 'KE',
            availableLanguage: ['English'],
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Nairobi',
            addressCountry: 'KE',
          },
          sameAs: [],
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
            name: 'Contact',
            item: `${baseUrl}/contact`,
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
      <ContactPageClient />
    </>
  )
}