'use client';

import { useState, useEffect } from 'react';
import { BookCard } from './BookCard';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Loader2, 
  BookOpen, 
  Sparkles, 
  TrendingUp,
  Library,
  SearchX,
  Filter
} from 'lucide-react';

interface Book {
  id: string;
  _id?: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  color: string;
  coverImage?: string;
  description?: string;
  isNew?: boolean;
  isBestseller?: boolean;
}

interface BooksSectionProps {
  title: string;
  description?: string;
  variant?: 'default' | 'featured' | 'bestsellers' | 'new-arrivals';
  filter?: 'all' | 'free' | 'premium';
  layout?: 'grid' | 'list';
}

const getBookColor = (index: number) => {
  const gradients = [
    'from-rose-400 via-pink-500 to-orange-400',
    'from-violet-400 via-purple-500 to-indigo-400',
    'from-emerald-400 via-teal-500 to-cyan-400',
    'from-amber-400 via-yellow-500 to-orange-400',
    'from-cyan-400 via-blue-500 to-indigo-400',
    'from-fuchsia-400 via-pink-500 to-rose-400',
    'from-lime-400 via-green-500 to-emerald-400',
    'from-sky-400 via-blue-500 to-indigo-400',
  ];
  return gradients[index % gradients.length];
};

export function BooksSection({ 
  title, 
  description, 
  variant = 'default',
  filter = 'all',
  layout = 'grid'
}: BooksSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(layout);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${backendUrl}/book/all-books`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || `Failed (${res.status})`);
      if (!Array.isArray(data.books)) throw new Error('Invalid format');

      const formattedBooks: Book[] = data.books.map((b: any, index: number) => {
        const hasPrice = b.price !== undefined && b.price !== null;
        const price = hasPrice ? Number(b.price) : Math.floor(Math.random() * 40) + 10;
        const originalPrice = b.originalPrice ? Number(b.originalPrice) : Math.floor(price * 1.25);
        const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

        return {
          id: b._id || b.id || String(index),
          title: b.title || 'Untitled',
          author: b.author || 'Unknown',
          genre: b.genre || 'General',
          rating: Number(b.rating) || (Math.random() * 1.5 + 3.5),
          price,
          originalPrice: originalPrice > price ? originalPrice : undefined,
          discount: discount > 0 ? discount : undefined,
          color: getBookColor(index),
          coverImage: b.coverImage || b.image || '',
          isNew: index < 3 || b.isNew,
          isBestseller: b.rating >= 4.5 || b.isBestseller,
        };
      });

      let filtered = formattedBooks;
      if (filter === 'free') filtered = formattedBooks.filter(b => b.price === 0);
      else if (filter === 'premium') filtered = formattedBooks.filter(b => b.price > 0);

      setBooks(filtered);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVariantBadge = () => {
    const badges = {
      bestsellers: { icon: TrendingUp, color: 'from-amber-400 to-orange-500', text: 'Trending' },
      'new-arrivals': { icon: Sparkles, color: 'from-emerald-400 to-teal-500', text: 'New' },
      featured: { icon: Library, color: 'from-violet-400 to-purple-500', text: 'Featured' },
    };
    
    if (variant === 'default') return null;
    const badge = badges[variant];
    if (!badge) return null;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs sm:text-sm font-bold shadow-lg`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden xs:inline">{badge.text}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary/20 border-t-primary rounded-full"
            />
            <p className="text-muted-foreground text-sm sm:text-base">Loading library...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center py-12 sm:py-16 bg-red-50 dark:bg-red-900/10 rounded-2xl sm:rounded-3xl border border-red-200 dark:border-red-800">
            <SearchX className="w-10 h-10 sm:w-16 sm:h-16 text-red-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error</h3>
            <p className="text-red-600 dark:text-red-300 text-sm sm:text-base mb-4 px-4">{error}</p>
            <button onClick={fetchBooks} className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-xl font-medium text-sm">
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!books.length) {
    return (
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center py-12 sm:py-20 bg-muted/30 rounded-2xl sm:rounded-3xl border border-dashed">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground/50 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-2xl font-bold mb-2">No books</h3>
            <p className="text-muted-foreground text-sm sm:text-base px-4">Try different filters</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-10 lg:mb-16"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            {getVariantBadge()}
            <span className="text-xs sm:text-sm text-muted-foreground">
              {books.length} book{books.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
                {title}
              </h2>
              {description && (
                <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
                  {description}
                </p>
              )}
            </div>
            
            {/* View Toggle - Desktop */}
            <div className="hidden sm:flex items-center gap-2 bg-muted rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'text-muted-foreground'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid - Ultra Responsive */}
        <div className={`
          grid gap-3 sm:gap-4 lg:gap-6
          ${viewMode === 'grid' 
            ? 'grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' 
            : 'grid-cols-1'
          }
        `}>
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              onMouseEnter={() => setHoveredBook(book.id)}
              onMouseLeave={() => setHoveredBook(null)}
              className={viewMode === 'list' ? 'w-full' : ''}
            >
              <BookCard 
                {...book} 
                isHovered={hoveredBook === book.id}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
