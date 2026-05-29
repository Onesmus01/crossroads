'use client';

import { useState, useEffect } from 'react';
import { BookCard } from './BookCard';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  BookOpen, 
  Sparkles, 
  TrendingUp,
  Library,
  SearchX,
  ChevronRight,
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
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

export function BooksSection({ 
  title, 
  description, 
  variant = 'default',
  filter = 'all',
}: BooksSectionProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredBook, setHoveredBook] = useState<string | null>(null);
  const [paidBookIds, setPaidBookIds] = useState<Set<string>>(new Set());

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';

  useEffect(() => {
    fetchBooks();
  }, []);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      const res = await fetch(`${backendUrl}/book/all-books`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
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
          genre: b.genre || 'General',
          author: b.author || 'Unknown Author',
          rating: Number(b.rating) || (Math.random() * 1.5 + 3.5),
          price,
          originalPrice: originalPrice > price ? originalPrice : undefined,
          discount: discount > 0 ? discount : undefined,
          color: `from-${['rose', 'violet', 'emerald', 'amber', 'cyan', 'fuchsia'][index % 6]}-400`,
          coverImage: b.coverImage || b.image || '',
          isNew: index < 3 || b.isNew,
          isBestseller: b.rating >= 4.5 || b.isBestseller,
        };
      });

      let filtered = formattedBooks;
      if (filter === 'free') filtered = formattedBooks.filter(b => b.price === 0);
      else if (filter === 'premium') filtered = formattedBooks.filter(b => b.price > 0);

      setBooks(filtered);

      const paidIds = new Set<string>();

      if (token && Array.isArray(data.books)) {
        data.books.forEach((b: any) => {
          if (b.isPurchased === true || b.isOwned === true || b.hasAccess === true) {
            paidIds.add(b._id || b.id);
          }
        });
      }

      if (token) {
        try {
          const ownershipRes = await fetch(`${backendUrl}/book/my-books`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          
          if (ownershipRes.ok) {
            const ownershipData = await ownershipRes.json();
            const ownedIds = ownershipData?.bookIds || ownershipData?.books?.map((b: any) => b._id || b.id) || [];
            ownedIds.forEach((id: string) => {
              if (id) paidIds.add(id);
            });
          }
        } catch (e) {
          console.error('Ownership check failed:', e);
        }
      }

      setPaidBookIds(paidIds);

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVariantStyles = () => {
    const styles = {
      bestsellers: {
        icon: TrendingUp,
        gradient: 'from-amber-500/20 via-orange-500/20 to-red-500/20',
        badge: 'bg-gradient-to-r from-amber-500 to-orange-500',
        text: 'Trending Now',
        decoration: '🔥'
      },
      'new-arrivals': {
        icon: Sparkles,
        gradient: 'from-emerald-500/20 via-teal-500/20 to-cyan-500/20',
        badge: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        text: 'Fresh Arrivals',
        decoration: '✨'
      },
      featured: {
        icon: Library,
        gradient: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
        badge: 'bg-gradient-to-r from-violet-500 to-purple-500',
        text: 'Editor\'s Pick',
        decoration: '⭐'
      },
      default: null
    };
    return styles[variant];
  };

  const variantStyle = getVariantStyles();

  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://www.christianity-at-the-crossroads.com';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: books.map((book, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Book',
        name: book.title,
        author: { '@type': 'Person', name: book.author },
        image: book.coverImage,
        url: `${baseUrl}/bookDetails/${book.id}`,
        offers: {
          '@type': 'Offer',
          price: book.price,
          priceCurrency: 'KES',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: book.rating ? {
          '@type': 'AggregateRating',
          ratingValue: book.rating,
          bestRating: 5,
        } : undefined,
      },
    })),
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background pointer-events-none" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="h-6 sm:h-8 w-24 sm:w-32 bg-muted rounded-full animate-pulse" />
            <div className="h-8 sm:h-12 w-3/4 max-w-lg bg-muted rounded-xl animate-pulse" />
            <div className="h-4 sm:h-6 w-1/2 max-w-md bg-muted rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2 sm:space-y-3">
                <div className="aspect-[2/3] bg-muted rounded-xl sm:rounded-2xl animate-pulse" />
                <div className="h-3 sm:h-4 bg-muted rounded-lg w-3/4 animate-pulse" />
                <div className="h-2.5 sm:h-3 bg-muted rounded-lg w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 rounded-2xl sm:rounded-3xl border border-red-200 dark:border-red-800/50"
          >
            <SearchX className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Unable to Load Books</h3>
            <p className="text-sm sm:text-base text-red-600 dark:text-red-300 mb-6">{error}</p>
            <button onClick={fetchBooks} className="px-6 py-2.5 bg-red-600 text-white rounded-full font-semibold text-sm">
              Try Again
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  if (!books.length) {
    return (
      <section className="py-12 sm:py-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center py-16 sm:py-24 bg-muted/30 rounded-2xl sm:rounded-3xl border border-dashed">
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Books Found</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="py-10 sm:py-16 lg:py-24 relative overflow-hidden"
      aria-label={title}
    >
      {variantStyle && (
        <div className={`absolute inset-0 bg-gradient-to-b ${variantStyle.gradient} opacity-30 pointer-events-none`} />
      )}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-10 lg:mb-16"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {variantStyle && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${variantStyle.badge} text-white text-xs font-bold shadow-lg`}>
                    <variantStyle.icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {variantStyle.text}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  {books.length} {books.length === 1 ? 'Book' : 'Books'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{title}</h2>
              {description && <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">{description}</p>}
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                variants={itemVariants}
                layout
                onMouseEnter={() => setHoveredBook(book.id)}
                onMouseLeave={() => setHoveredBook(null)}
              >
                <BookCard 
                  {...book} 
                  isHovered={hoveredBook === book.id}
                  isUnlocked={paidBookIds.has(book.id)}
                  priority={index < 5}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {books.length > 10 && (
          <div className="mt-8 sm:mt-12 text-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 rounded-full font-medium text-sm transition-colors">
              View All Books <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </section>
  );
}