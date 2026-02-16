'use client';

import { useState, useEffect } from 'react';
import { BookCard } from './BookCard';
import { toast } from 'react-hot-toast';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  color: string;
  coverImage?: string; // full Cloudinary URL
}

interface BooksSectionProps {
  title: string;
  description?: string;
}

export function BooksSection({ title, description }: BooksSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${backendUrl}/book/all-books`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch books');
        }

        if (!Array.isArray(data.books)) {
          throw new Error('Invalid books data format');
        }

        // ✅ Cloudinary URLs are returned from backend, pass them directly
        const formattedBooks: Book[] = data.books.map((b: any) => ({
          id: b._id,
          title: b.title,
          author: b.author || 'Unknown',
          genre: b.genre || 'General',
          rating: b.rating || 0,
          color: 'bg-indigo-500',
          coverImage: b.coverImage || '', // already full Cloudinary URL
        }));

        setBooks(formattedBooks);
      } catch (err: any) {
        console.error('Fetch Books Error:', err);
        toast.error(err.message || 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [backendUrl]);

  if (loading) {
    return (
      <p className="text-center py-12 text-muted-foreground">
        Loading books...
      </p>
    );
  }

  if (!books.length) {
    return (
      <p className="text-center py-12 text-muted-foreground">
        No books available.
      </p>
    );
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>
      </div>
    </section>
  );
}
