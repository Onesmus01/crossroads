'use client';

import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  SlidersHorizontal, 
  BookOpen, 
  Library,
  ArrowUp,
  X,
  Flame,
  TrendingUp,
  Clock,
  Star,
  ShoppingBag,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BookCard } from '@/components/BookCard';

// ─── Types ─────────────────────────────────────────────
interface Book {
  _id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  price: number;
  coverImage?: string;
  createdAt?: string;
  isBestseller?: boolean;
}

interface ApiResponse {
  success: boolean;
  books?: Book[];
  message?: string;
}

// ─── Constants ───────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

// ─── Memoized BookCard Wrapper for Performance ───────────
const MemoBookCard = memo(function MemoBookCard({ 
  book, 
  isNewFlag, 
  isBestsellerFlag, 
  isUnlockedFlag,
  onPay 
}: { 
  book: Book; 
  isNewFlag: boolean; 
  isBestsellerFlag: boolean; 
  isUnlockedFlag: boolean;
  onPay: (book: any) => void;
}) {
  return (
    <BookCard
      id={book._id}
      title={book.title}
      author={book.author}
      genre={book.genre}
      rating={book.rating}
      price={book.price}
      coverImage={book.coverImage}
      color="amber"
      isNew={isNewFlag}
      isBestseller={isBestsellerFlag}
      isUnlocked={isUnlockedFlag}
      onPay={onPay}
    />
  );
});

// ─── Shimmer Skeleton ────────────────────────────────────
function BookSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className="aspect-[2/3] rounded-xl bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative mb-3">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-3/4" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/2" />
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-1/3" />
      </div>
    </motion.div>
  );
}

// ─── Debounce Hook ───────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Main Page ───────────────────────────────────────────
export default function BooksPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Data state
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paidBookIds, setPaidBookIds] = useState<Set<string>>(new Set());
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest'>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch books + ownership status (mirrors BookDetails logic)
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token') || '';
        const url = `${API_URL}/book/all-books`;
        
        console.log('🌐 Fetching:', url);

        const res = await fetch(url, {
          signal: controller.signal,
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
        });

        const data = await res.json();
        console.log('📦 Response:', data);

        if (!res.ok) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }

        // ✅ FIXED: Accept both { success: true, books: [] } and { books: [] }
        const booksArray = data?.books || data;
        
        if (!Array.isArray(booksArray)) {
          throw new Error('Invalid response: expected array of books');
        }

        setBooks(booksArray);

        // ═══════════════════════════════════════════════════
        //  Ownership check — same sources as BookDetailsClient
        // ═══════════════════════════════════════════════════
        const paidIds = new Set<string>();

        // 1️⃣ LocalStorage (instant, sync) — BookDetails writes here after M-Pesa
        try {
          const stored = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
          if (Array.isArray(stored)) {
            stored.forEach((id: string) => paidIds.add(id));
          }
        } catch {
          // ignore parse errors
        }

        // 2️⃣ Backend flag inside book objects (if your API sends isPurchased / isOwned)
        booksArray.forEach((b: any) => {
          if (b.isPurchased || b.isOwned || b.hasAccess) {
            paidIds.add(b._id || b.id);
          }
        });

        // 3️⃣ Payment history (async verification) — uses your Payment model
        if (token) {
          try {
            const paymentUrl = `${API_URL}/payment/user-payments`;
            const paymentRes = await fetch(paymentUrl, {
              signal: controller.signal,
              credentials: 'include',
              headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
            });

            if (paymentRes.ok) {
              const paymentData = await paymentRes.json();
              const payments = paymentData?.payments || paymentData || [];
              payments
                .filter((p: any) => p.status === 'success')
                .forEach((p: any) => {
                  const bookId = typeof p.book === 'string' 
                    ? p.book 
                    : (p.book?._id?.toString?.() || p.book?.toString?.());
                  if (bookId) paidIds.add(bookId);
                });
            }
          } catch (paymentErr: any) {
            if (paymentErr.name === 'AbortError') return;
            console.error('❌ Payment fetch error:', paymentErr);
            // Non-critical: localStorage already gives us instant feedback
          }
        }

        setPaidBookIds(paidIds);
        console.log('💰 Paid books loaded:', paidIds.size);

      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('❌ Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    return () => controller.abort();
  }, []);

  // Scroll listener for back-to-top
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Derived: genres (memoized)
  const genres = useMemo(() => {
    const set = new Set(books.map(b => b.genre));
    return ['All', ...Array.from(set).sort()];
  }, [books]);

  // Derived: stats
  const stats = useMemo(() => {
    const total = books.length;
    const free = books.filter(b => b.price === 0).length;
    const avgRating = total > 0 
      ? (books.reduce((sum, b) => sum + b.rating, 0) / total).toFixed(1) 
      : '0.0';
    return { total, free, avgRating };
  }, [books]);

  // Derived: filtered & sorted books (uses debounced search)
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q)
      );
    }

    if (selectedGenre !== 'All') {
      result = result.filter(b => b.genre === selectedGenre);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        break;
      default:
        result.sort((a, b) => {
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          return b.rating - a.rating;
        });
    }

    return result;
  }, [books, debouncedSearch, selectedGenre, sortBy]);

  // Helpers
  const isNew = useCallback((createdAt?: string) => {
    if (!createdAt) return false;
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 14;
  }, []);

  const handlePay = useCallback((book: any) => {
    router.push(`/bookDetails/${book.id}`);
  }, [router]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGenre('All');
    setSortBy('relevance');
    searchInputRef.current?.focus();
  }, []);

  const activeFiltersCount = useMemo(() => 
    (searchQuery ? 1 : 0) + 
    (selectedGenre !== 'All' ? 1 : 0) + 
    (sortBy !== 'relevance' ? 1 : 0),
  [searchQuery, selectedGenre, sortBy]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      
      {/* ═══════ Hero Header ═══════ */}
      <div className="relative overflow-hidden pt-8 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/5 to-orange-600/5 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Breadcrumb / label */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full border border-amber-500/20">
                Digital Library
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {stats.total} Books Available
              </span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Discover Your Next{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 animate-gradient-x">
                Great Read
              </span>
            </h1>
            
            <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-2xl leading-relaxed">
              Explore our curated collection of Christian books, devotionals, and theological works crafted for your spiritual journey.
            </p>

            {/* Quick Stats Pills */}
            {!loading && books.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3 mt-6"
              >
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <Library className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{stats.total} Books</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{stats.avgRating} Avg Rating</span>
                </div>
                {stats.free > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{stats.free} Free</span>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ═══════ Controls Bar ═══════ */}
      <div className="sticky top-0 z-30 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search titles, authors, genres... (press / to focus)"
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-zinc-400 shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all shadow-sm ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 w-5 h-5 flex items-center justify-center bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-40 pl-3 pr-8 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 appearance-none cursor-pointer shadow-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low</option>
                <option value="price-high">Price: High</option>
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 rotate-90" />
              </div>
            </div>
          </div>

          {/* Expandable Genre Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pt-3 pb-1 flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selectedGenre === genre
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results bar */}
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span className="font-medium">
              {loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                  Loading library...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3" />
                  {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} found
                </span>
              )}
            </span>
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════ Content ═══════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <BookSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-red-100 dark:ring-red-900/20">
              <BookOpen className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Unable to load books</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mb-6 leading-relaxed">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              Retry Connection
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBooks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-zinc-200 dark:ring-zinc-700">
              <Search className="w-10 h-10 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No books found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mb-6 leading-relaxed">
              {searchQuery || selectedGenre !== 'All' 
                ? 'Try adjusting your search terms or filters to discover more titles in our collection.'
                : 'Our shelves are currently empty. New arrivals are coming soon — check back later!'}
            </p>
            {(searchQuery || selectedGenre !== 'All') && (
              <button
                onClick={clearFilters}
                className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}

        {/* Book Grid */}
        {!loading && !error && filteredBooks.length > 0 && (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
          >
            <AnimatePresence mode='popLayout'>
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book._id}
                  layout
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.35, 
                    delay: Math.min(index * 0.04, 0.5),
                    ease: 'easeOut'
                  }}
                >
                  <MemoBookCard
                    book={book}
                    isNewFlag={isNew(book.createdAt)}
                    isBestsellerFlag={book.isBestseller || book.rating >= 4.5}
                    isUnlockedFlag={paidBookIds.has(book._id)}
                    onPay={handlePay}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ═══════ Scroll to Top ═══════ */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full shadow-xl shadow-zinc-900/20 flex items-center justify-center hover:scale-110 transition-transform ring-1 ring-zinc-900/10 dark:ring-white/10"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}