import { Header } from '@/components/Header';
import Hero from '@/components/Hero';
import { BooksSection } from '@/components/BooksSection';
import { Footer } from '@/components/Footer';


export const metadata = {
  title: 'Christianity Crossroads - Explore Faith and Community',
  description: 'Discover inspiring content, connect with fellow believers, and deepen your faith at Christianity Crossroads.',
  keywords: ['Christianity', 'Faith', 'Community', 'Inspiration', 'Spiritual Growth'],
  openGraph: {
    title: 'Christianity Crossroads - Explore Faith and Community: unlimited wisdom',
    description: 'Discover inspiring content, connect with fellow believers, and deepen your faith at Christianity Crossroads.',
    url: 'https://www.christianitycrossroads.com',
    siteName: 'Christianity Crossroads',
    images: [
      {
        url: 'https://www.christianitycrossroads.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Christianity Crossroads - Explore Faith and Community',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Christianity Crossroads - Explore Faith and Community',
    description: 'Discover inspiring content, connect with fellow believers, and deepen your faith at Christianity Crossroads.',
    creator: '@ChristianityCrossroads',
    images: ['https://www.christianitycrossroads.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
    noindex: false,
    nofollow: false,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noarchive: false,
      nosnippet: false,
      noimageindex: false,
      notranslate: false,
      noindex: false,
      nofollow: false,
      nocache: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },  
  generator: 'Christianity Crossroads App',
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Christianity Crossroads",
  "url": "https://www.christianitycrossroads.com",
  "description": "Discover inspiring content, connect with fellow believers, and deepen your faith at Christianity Crossroads.",
  "publisher": {
    "@type": "Organization",
    "name": "Christianity Crossroads"
  }
};

export const metadataBase = new URL('https://www.christianitycrossroads.com');

export const alternates = {
  canonical: 'https://www.christianitycrossroads.com',
};


export default function Home() {
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
  />
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1">
    <Hero />
    <div className="-mt-2 sm:-mt-4"> {/* Pulls BooksSection up slightly */}
        <BooksSection 
          title="Featured Books" 
          description="Handpicked for you"
          variant="featured"
        />
      </div>
    </main>
          </div>
  );
}