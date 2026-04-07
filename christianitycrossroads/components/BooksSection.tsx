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
  Grid3X3,
  LayoutList,
  ChevronRight,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
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

  // Loading Skeleton
  if (loading) {
    return (
      <section className="py-16 sm:py-24 lg:py-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header Skeleton */}
          <div className="mb-12 space-y-4">
            <div className="h-8 w-32 bg-muted rounded-full animate-pulse" />
            <div className="h-12 w-3/4 max-w-lg bg-muted rounded-xl animate-pulse" />
            <div className="h-6 w-1/2 max-w-md bg-muted rounded-lg animate-pulse" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[2/3] bg-muted rounded-2xl animate-pulse" />
                <div className="h-4 bg-muted rounded-lg w-3/4 animate-pulse" />
                <div className="h-3 bg-muted rounded-lg w-1/2 animate-pulse" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 bg-muted rounded-lg w-20 animate-pulse" />
                  <div className="h-8 bg-muted rounded-lg w-16 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error State
  if (error) {
    return (
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-6 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 rounded-3xl border border-red-200 dark:border-red-800/50 shadow-xl shadow-red-500/5"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <SearchX className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">Unable to Load Books</h3>
            <p className="text-red-600 dark:text-red-300 mb-8 max-w-md mx-auto">{error}</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchBooks} 
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow-lg shadow-red-500/30 transition-colors inline-flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4" />
              Try Again
            </motion.button>
          </motion.div>
        </div>
      </section>
    );
  }

  // Empty State
  if (!books.length) {
    return (
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 px-6 bg-gradient-to-br from-muted/50 via-muted/30 to-background rounded-3xl border border-dashed border-muted-foreground/20"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No Books Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">We couldn't find any books matching your criteria. Try adjusting your filters or check back later.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-20 lg:py-28 relative overflow-hidden">
      {/* Subtle background gradient */}
      {variantStyle && (
        <div className={`absolute inset-0 bg-gradient-to-b ${variantStyle.gradient} opacity-30 pointer-events-none`} />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 sm:mb-16"
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-4">
              {/* Badge Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {variantStyle && (
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${variantStyle.badge} text-white text-sm font-bold shadow-lg`}
                  >
                    <variantStyle.icon className="w-4 h-4" />
                    {variantStyle.text}
                    <span className="text-lg">{variantStyle.decoration}</span>
                  </motion.span>
                )}
                
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                  <BookOpen className="w-4 h-4" />
                  {books.length} {books.length === 1 ? 'Book' : 'Books'}
                </span>
              </div>

              {/* Title */}
              <div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
                >
                  {title}
                </motion.h2>
                {description && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed"
                  >
                    {description}
                  </motion.p>
                )}
              </div>
            </div>

            {/* View Toggle - Premium Pill */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 bg-muted/80 backdrop-blur-sm rounded-2xl p-1.5 border border-border/50 shadow-sm"
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-zinc-800 shadow-md text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-zinc-800 shadow-md text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutList className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Books Grid with Stagger Animation */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1 max-w-3xl mx-auto'
          }`}
        >
          <AnimatePresence mode='popLayout'>
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                variants={itemVariants}
                layout
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
          </AnimatePresence>
        </motion.div>

        {/* Show More Button (if many books) */}
        {books.length > 10 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <button className="group inline-flex items-center gap-2 px-6 py-3 bg-muted hover:bg-muted/80 rounded-full font-medium transition-colors">
              View All Books
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}