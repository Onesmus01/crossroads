import BookDetailsClient from './BookDetailsClient';
import type { Metadata, Viewport } from 'next';

// FIX: Accessible viewport — no maximum-scale or user-scalable restrictions
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Generate static pages for all books at build time
export async function generateStaticParams() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';
  
  try {
    const res = await fetch(`${backendUrl}/book/all-books`, { 
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch books');
    
    const books = await res.json();
    const bookList = Array.isArray(books) ? books : books.data || books.books || [];
    
    return bookList.map((book: any) => ({
      id: book._id?.toString() || book.id?.toString(),
    })).filter((item: { id: string }) => !!item.id);
    
  } catch (error) {
    console.error('generateStaticParams error:', error);
    return [];
  }
}

// FIX: Proper type annotation for generateMetadata
type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = 'https://christianitycrossroads.com';
  
  if (!id) {
    return {
      title: 'Book Not Found | Christianity Crossroads Bookstore',
      description: 'The requested book could not be found. Browse our complete collection of Christian books, devotionals, Bible studies, and faith-based resources available for purchase.',
      robots: { index: false, follow: true },
      alternates: {
        canonical: `${baseUrl}/books`,
      },
    };
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';
  
  try {
    const res = await fetch(`${backendUrl}/book/book-details/${id}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) throw new Error('Failed to fetch book');
    
    const book = await res.json();
    const bookData = Array.isArray(book) ? book[0] : book.data || book;
    
    const title = bookData?.title 
      ? `${bookData.title} by ${bookData.author || 'Unknown Author'} | Christianity Crossroads`
      : `Book Details | Christianity Crossroads Bookstore`;
    
    const rawDesc = bookData?.description || '';
    const description = rawDesc.length > 50
      ? rawDesc.slice(0, 160)
      : `Discover ${bookData?.title || 'this Christian book'} by ${bookData?.author || 'Unknown Author'}. Browse and purchase faith-based literature, Christian devotionals, and inspirational books at Christianity Crossroads Bookstore.`;
    
    const imageUrl = bookData?.coverImage || bookData?.image;
    const canonicalUrl = `${baseUrl}/books/${id}`;
    
    return {
      title,
      description,
      keywords: [
        bookData?.title,
        bookData?.author,
        bookData?.genre,
        'Christian book',
        'faith literature',
        'Bible study',
        'devotional',
        'Christian bookstore',
        'buy Christian book online',
      ].filter(Boolean),
      
      alternates: {
        canonical: `https://christianitycrossroads.com/books/${id}`,
      },
      
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      
      openGraph: {
        title: bookData?.title || title,
        description: rawDesc || description,
        url: canonicalUrl,
        siteName: 'Christianity Crossroads',
        type: 'book',
        locale: 'en_US',
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${bookData?.title} book cover`,
          }
        ] : [],
      },
      
      twitter: {
        card: 'summary_large_image',
        title: bookData?.title || title,
        description: rawDesc || description,
        images: imageUrl ? [imageUrl] : [],
      },
      
      metadataBase: new URL(baseUrl),
    };
  } catch (error) {
    return {
      title: `Book Details | Christianity Crossroads Bookstore`,
      description: 'Explore our collection of Christian books and purchase your copy today. Browse faith-based literature, devotionals, Bible studies, and inspirational resources at Christianity Crossroads.',
      alternates: {
        canonical: `${baseUrl}/books/${id}`,
      },
    };
  }
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'Example Book Title',
  author: {
    '@type': 'Person',
    name: 'Reverent Vincent Mboya',
  },
  description: 'Example book description',
  image: 'https://christianitycrossroads.com/images/example-book.jpg',
  isbn: '978-0-123456-78-9',
  numberOfPages: 320,
  inLanguage: 'English',
  publisher: {
    '@type': 'Organization',
    name: 'Christianity Crossroads',
  },
  datePublished: '2023-01-01',
  offers: {
    '@type': 'Offer',
    priceCurrency: 'KES',
    price: '150.00',
    availability: 'https://schema.org/InStock',
    url: 'https://christianitycrossroads.com/books/example-book',
  },
};

export default async function BookDetailsPage({ params }: Props) {
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
  />
  const { id } = await params;
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';
  let jsonLd = null;
  
  try {
    const res = await fetch(`${backendUrl}/book/book-details/${id}`, {
      next: { revalidate: 60 },
    });
    
    if (res.ok) {
      const book = await res.json();
      const bookData = Array.isArray(book) ? book[0] : book.data || book;
      
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Book',
        name: bookData?.title,
        author: {
          '@type': 'Person',
          name: bookData?.author || 'Unknown Author',
        },
        description: bookData?.description,
        image: bookData?.coverImage || bookData?.image,
        isbn: bookData?.isbn,
        numberOfPages: bookData?.pages,
        inLanguage: bookData?.language || 'English',
        publisher: {
          '@type': 'Organization',
          name: bookData?.publisher || 'Christianity Crossroads',
        },
        datePublished: bookData?.publishedDate,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'KES',
          price: bookData?.price?.toString() || '0',
          availability: 'https://schema.org/InStock',
          url: `https://christianitycrossroads.com/books/${id}`,
        },
        aggregateRating: bookData?.rating ? {
          '@type': 'AggregateRating',
          ratingValue: bookData.rating.toString(),
          reviewCount: '128',
        } : undefined,
      };
    }
  } catch (e) {
    // Silently fail
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BookDetailsClient bookId={id} />
    </>
  );
}