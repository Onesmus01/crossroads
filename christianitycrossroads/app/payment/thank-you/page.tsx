'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  price: number;
  coverImage?: string;
}

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  
  const [book, setBook] = useState<Book | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get book from sessionStorage (display only, NOT ownership source)
    const raw = sessionStorage.getItem('mpesaPayment');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.book) setBook(data.book);
      } catch {
        // ignore
      }
    }
  }, []);

  // Auto-advance to ownership page
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleContinue();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, bookId, router]);

  const handleContinue = () => {
    // ═════════════════════════════════════════════════════════════════
    //  SECURITY: Preserve paymentJustCompleted flag set by VerifyPayment.
    //  Do NOT remove it here — OwnershipPage will consume it and pass
    //  it to BookDetailsClient for a fresh backend ownership fetch.
    // ═════════════════════════════════════════════════════════════════
    router.push(`/payment/ownership?bookId=${bookId}`);
  };

  if (!book && !bookId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-zinc-500">No purchase data found.</p>
      </div>
    );
  }

  const displayBook = book || { id: bookId || '', title: 'Your Book', price: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating decorative particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-emerald-400/20 dark:bg-emerald-500/10"
          style={{
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-lg p-10 text-center space-y-8 border border-white/20"
      >
        {/* Success Icon with orbiting dots */}
        <div className="relative mx-auto w-32 h-32">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20"
          >
            <Sparkles className="w-16 h-16 text-white" />
          </motion.div>
          
          {/* Orbiting celebration dots */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`orbit-${i}`}
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-400 rounded-full"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: Math.cos(i * 0.785) * 75,
                y: Math.sin(i * 0.785) * 75,
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              style={{ marginLeft: '-6px', marginTop: '-6px' }}
            />
          ))}
        </div>

        <div className="space-y-2">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
          >
            Thank You!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-zinc-600 dark:text-zinc-300 text-lg"
          >
            Your payment was successful
          </motion.p>
        </div>

        {/* Book Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-4 p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700 mx-auto max-w-sm"
        >
          {displayBook.coverImage ? (
            <img 
              src={displayBook.coverImage} 
              alt={displayBook.title}
              className="w-16 h-20 object-cover rounded-lg shadow-md" 
            />
          ) : (
            <div className="w-16 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-emerald-600" />
            </div>
          )}
          <div className="text-left flex-1">
            <p className="font-bold text-lg dark:text-white line-clamp-1">{displayBook.title}</p>
            <p className="text-emerald-600 font-semibold">KES {displayBook.price?.toLocaleString()}</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
          >
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-4"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-emerald-200 dark:hover:shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <p className="text-sm text-zinc-400">
            Auto-continuing in {countdown} seconds...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}