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
  coverImage?: string; // added coverImage
}

interface BooksSectionProps {
  title: string;
  description?: string;
}

export function BooksSection({ title, description }: BooksSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${backendUrl}/books`); // replace with your API endpoint
        if (!res.ok) throw new Error('Failed to fetch books');

        const data = await res.json();
        // Map API data to Book type
        const formattedBooks = data.map((b: any) => ({
          id: b._id,
          title: b.title,
          author: b.author || 'Unknown',
          genre: b.genre || 'General',
          rating: b.rating || 0,
          color: 'bg-indigo-500', // default color, can also map dynamically
          coverImage: b.coverImage || '', // optional
        }));
        setBooks(formattedBooks);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <p className="text-center py-12">Loading books...</p>;

  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">{title}</h2>
          {description && <p className="text-muted-foreground">{description}</p>}
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
