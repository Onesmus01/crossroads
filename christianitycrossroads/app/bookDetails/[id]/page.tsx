import BookDetailsClient from './BookDetailsClient';

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

// Generate metadata for each book page
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `Book Details - ${id}`,
    description: 'View book details and purchase',
  };
}

// FIX: Make component async and await params
export default async function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookDetailsClient bookId={id} />;
}