'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Star, Download, BookOpen, Share2, Heart, 
  Clock, Globe, FileText, Loader2, Lock, Smartphone, 
  Shield, AlertCircle, ChevronRight, FileDown, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MpesaPaymentModal } from '@/components/MpesaPaymentModal';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  price: number;
  originalPrice?: number;
  description: string;
  coverImage?: string;
  fileUrl?: string;
  pages: string;
  language: string;
  publisher: string;
  publishedDate: string;
  isbn: string;
  format: string;
  fileSize: string;
}

interface DownloadResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  message?: string;
}

interface BookDetailsClientProps {
  bookId: string;
}

export default function BookDetailsClient({ bookId }: BookDetailsClientProps) {
  const router = useRouter();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpeningReader, setIsOpeningReader] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const [readerUrl, setReaderUrl] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  };

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
      verifyOwnership();
    }
  }, [bookId]);

  const verifyOwnership = async () => {
    try {
      setCheckingOwnership(true);
      const token = getAuthToken();
      
      if (!token) {
        const purchasedBooks = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
        setIsPurchased(purchasedBooks.includes(bookId));
        return;
      }

      const res = await fetch(`${backendUrl}/book/${bookId}/check-ownership`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setIsPurchased(data.isPurchased || data.owned);
        
        if (data.isPurchased) {
          const purchasedBooks = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
          if (!purchasedBooks.includes(bookId)) {
            purchasedBooks.push(bookId);
            localStorage.setItem('purchasedBooks', JSON.stringify(purchasedBooks));
          }
        }
      }
    } catch (error) {
      console.error('Ownership check failed:', error);
      const purchasedBooks = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
      setIsPurchased(purchasedBooks.includes(bookId));
    } finally {
      setCheckingOwnership(false);
    }
  };

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/book/${bookId}`);
      
      if (!res.ok) throw new Error('Failed to fetch book');
      
      const data = await res.json();
      
      if (data.book) {
        setBook({
          id: data.book._id || data.book.id || bookId,
          title: data.book.title || 'Untitled Book',
          author: data.book.author || 'Unknown Author',
          genre: data.book.genre || 'General',
          rating: typeof data.book.rating === 'number' ? data.book.rating : 4.0,
          price: typeof data.book.price === 'number' ? data.book.price : 0,
          originalPrice: typeof data.book.originalPrice === 'number' ? data.book.originalPrice : undefined,
          description: data.book.description || 'No description available.',
          coverImage: data.book.coverImage || '',
          fileUrl: data.book.fileUrl || '',
          pages: String(data.book.pages || '324'),
          language: data.book.language || 'English',
          publisher: data.book.publisher || 'Unknown Publisher',
          publishedDate: String(data.book.publishedDate || '2024'),
          isbn: data.book.isbn || '978-0000000000',
          format: data.book.format || 'PDF',
          fileSize: data.book.fileSize || '2.4 MB',
        });
      }
    } catch (error) {
      toast.error('Failed to load book details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSecureDownload = async () => {
    if (!isPurchased && book?.price && book.price > 0) {
      setShowPaymentModal(true);
      return;
    }

    setIsDownloading(true);
    const toastId = toast.loading('Preparing your download...');

    try {
      const token = getAuthToken();
      
      const res = await fetch(`${backendUrl}/book/${bookId}/download`, {
        credentials: 'include',
        headers: { 
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      const data: DownloadResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Download unauthorized');
      }

      if (!data.fileUrl) {
        throw new Error('Download link not available');
      }

      const fileRes = await fetch(data.fileUrl);
      
      if (!fileRes.ok) throw new Error('Failed to fetch file from storage');

      const blob = await fileRes.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = data.fileName || `${book?.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started! Check your downloads folder.', { 
        id: toastId, 
        icon: '📥',
        duration: 4000
      });

      await fetch(`${backendUrl}/book/${bookId}/download-log`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});

    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Download failed. Try again.', { id: toastId });
      
      if (error.message?.includes('unauthorized') || error.message?.includes('purchase')) {
        setIsPurchased(false);
        setShowPaymentModal(true);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReadOnline = async () => {
    if (!isPurchased && book?.price && book.price > 0) {
      setShowPaymentModal(true);
      return;
    }

    setIsOpeningReader(true);
    
    try {
      const token = getAuthToken();
      
      const res = await fetch(`${backendUrl}/book/${bookId}/download`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      const data: DownloadResponse = await res.json();

      if (!data.success || !data.fileUrl) {
        throw new Error('Unable to access book');
      }

      if (data.fileUrl.endsWith('.pdf')) {
        const viewerUrl = `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(data.fileUrl)}`;
        setReaderUrl(viewerUrl);
      } else {
        window.open(data.fileUrl, '_blank');
      }
      
      toast.success('Opening book reader...', { icon: '📖' });
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to open book');
      setIsOpeningReader(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setIsPurchased(true);
    
    const purchasedBooks = JSON.parse(localStorage.getItem('purchasedBooks') || '[]');
    if (!purchasedBooks.includes(bookId)) {
      purchasedBooks.push(bookId);
      localStorage.setItem('purchasedBooks', JSON.stringify(purchasedBooks));
    }
    
    toast.success('Payment successful! You can now download or read the book.', { 
      duration: 5000,
      icon: '🎉'
    });
    
    await fetchBookDetails();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Book link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast(isLiked ? 'Removed from favorites' : 'Added to favorites', {
      icon: isLiked ? '💔' : '❤️'
    });
  };

  const discount = book?.originalPrice && book?.price && book.originalPrice > book.price
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-zinc-500">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="text-center p-8">
          <AlertCircle className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Book not found</h2>
          <p className="text-zinc-500 mb-6">The book you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.back()} 
            className="px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (readerUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-zinc-900 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setReaderUrl(null)} 
              className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h3 className="text-white font-semibold text-sm line-clamp-1">{book.title}</h3>
              <p className="text-zinc-400 text-xs">by {book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSecureDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <iframe 
            src={readerUrl} 
            className="w-full h-full border-0"
            title={book.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleShare} 
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Share book"
              >
                <Share2 className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
              </button>
              <button 
                onClick={handleLike} 
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Add to favorites"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-600 dark:text-zinc-300'}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Cover Section */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="sticky top-24"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 group">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-200 dark:bg-zinc-800">
                    <span className="text-8xl font-bold text-zinc-400">{book.title.charAt(0)}</span>
                  </div>
                )}
                
                {!isPurchased && book.price > 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur- flex flex-col items-center justify-center text-white">
                    <Lock className="w-12 h-12 mb-3 opacity-80" />
                    <p className="text-sm font-medium opacity-80">Purchase to unlock</p>
                  </div>
                )}

                {isPurchased && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="mt-6 lg:hidden space-y-3">
                <ActionButtons 
                  isPurchased={isPurchased}
                  isFree={book.price === 0}
                  isDownloading={isDownloading}
                  isOpeningReader={isOpeningReader}
                  checkingOwnership={checkingOwnership}
                  onRead={handleReadOnline}
                  onDownload={handleSecureDownload}
                  onBuy={() => setShowPaymentModal(true)}
                />
              </div>
            </motion.div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold rounded-full">
                  {book.genre}
                </span>
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-700 dark:text-amber-300">{book.rating.toFixed(1)}</span>
                  <span className="text-amber-600/60 text-sm ml-1">(128 reviews)</span>
                </div>
                {discount > 0 && (
                  <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-sm font-bold rounded-full">
                    Save {discount}%
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight">
                {book.title}
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8">
                by <span className="font-semibold text-zinc-700 dark:text-zinc-300">{book.author}</span>
              </p>

              <div className="hidden lg:block mb-10 p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    {isPurchased ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-emerald-600">You own this book</p>
                          <p className="text-sm text-zinc-500">Download or read online anytime</p>
                        </div>
                      </div>
                    ) : book.price === 0 ? (
                      <div>
                        <p className="text-3xl font-bold text-emerald-600">Free Book</p>
                        <p className="text-sm text-zinc-500 mt-1">Add to your library at no cost</p>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-zinc-900 dark:text-white">KES {book.price}</span>
                        {book.originalPrice && book.originalPrice > book.price && (
                          <span className="text-xl text-zinc-400 line-through">KES {book.originalPrice}</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isPurchased || book.price === 0 ? (
                      <>
                        <button 
                          onClick={handleReadOnline}
                          disabled={isOpeningReader}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                        >
                          {isOpeningReader ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                          Read Online
                        </button>
                        <button 
                          onClick={handleSecureDownload}
                          disabled={isDownloading}
                          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all disabled:opacity-50"
                        >
                          {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                          Download
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
                      >
                        <Smartphone className="w-5 h-5" />
                        Buy with M-Pesa
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6">
                <div className="flex gap-8">
                  {['overview', 'details'].map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-4 text-sm font-semibold capitalize transition-colors relative ${
                        activeTab === tab 
                          ? 'text-emerald-600' 
                          : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="prose dark:prose-invert max-w-none"
                  >
                    <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 mb-8">
                      {book.description}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard icon={BookOpen} label="Pages" value={book.pages} />
                      <StatCard icon={Globe} label="Language" value={book.language} />
                      <StatCard icon={FileText} label="Format" value={book.format} />
                      <StatCard icon={Clock} label="Published" value={book.publishedDate} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <DetailRow label="Publisher" value={book.publisher} />
                    <DetailRow label="ISBN" value={book.isbn} />
                    <DetailRow label="File Size" value={book.fileSize} />
                    <DetailRow label="Format" value={`${book.format} (DRM-free)`} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10 flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                <Shield className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Secure & Instant Access</h4>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    Once purchased, this book is yours forever. Download it to any device or read online. 
                    All transactions are secured via M-Pesa.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        book={{
          id: book.id,
          title: book.title,
          price: book.price,
          coverImage: book.coverImage
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

// Sub-components
function ActionButtons({ 
  isPurchased, 
  isFree, 
  isDownloading, 
  isOpeningReader,
  checkingOwnership,
  onRead, 
  onDownload, 
  onBuy 
}: {
  isPurchased: boolean;
  isFree: boolean;
  isDownloading: boolean;
  isOpeningReader: boolean;
  checkingOwnership: boolean;
  onRead: () => void;
  onDownload: () => void;
  onBuy: () => void;
}) {
  if (checkingOwnership) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
        <span className="text-zinc-500">Checking access...</span>
      </div>
    );
  }

  if (isPurchased || isFree) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onRead}
          disabled={isOpeningReader}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold disabled:opacity-50"
        >
          {isOpeningReader ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
          Read
        </button>
        <button 
          onClick={onDownload}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl font-semibold disabled:opacity-50"
        >
          {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
          Download
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={onBuy}
      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
    >
      <Smartphone className="w-5 h-5" />
      Buy with M-Pesa
    </button>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-center">
      <Icon className="w-5 h-5 text-zinc-400 mx-auto mb-2" />
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="font-bold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-900 dark:text-white">{value}</span>
    </div>
  );
}