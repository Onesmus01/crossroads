'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookCheck, Download, Heart, Sparkles, BookOpen, Infinity, ArrowRight } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  coverImage?: string;
}

export default function OwnershipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  
  const [book, setBook] = useState<Book | null>(null);

  useEffect(() => {
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

  const handleGoToBook = () => {
    // ═════════════════════════════════════════════════════════════════
    //  SECURITY: Set flag so BookDetails re-fetches ownership from
    //  BACKEND on arrival. Never trust localStorage for ownership.
    // ═════════════════════════════════════════════════════════════════
    sessionStorage.removeItem('mpesaPayment');
    sessionStorage.setItem('paymentJustCompleted', 'true');
    
    router.push(`/bookDetails/${bookId || book?.id}`);
  };

  const displayBook = book || { id: bookId || '', title: 'Your Book' };

  const features = [
    {
      icon: <Download className="w-7 h-7 text-blue-600" />,
      title: "Read or Download",
      description: "Access your book anytime — read online instantly or download for offline reading.",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
    },
    {
      icon: <Heart className="w-7 h-7 text-rose-600" />,
      title: "Yours Forever",
      description: "Once purchased, this book belongs to you permanently. No expiry dates, no hidden fees.",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-100 dark:border-rose-800",
      text: "text-rose-700 dark:text-rose-300",
    },
    {
      icon: <Infinity className="w-7 h-7 text-amber-600" />,
      title: "Unlimited Access",
      description: "Re-read as many times as you want. Your library grows with every purchase.",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-100 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-lg pt-14 space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20"
          >
            <BookCheck className="w-12 h-12 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold dark:text-white">
              You Are Now the Owner!
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg">
              Congratulations on your new book
            </p>
          </motion.div>
        </div>

        {/* Book Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg border border-zinc-100 dark:border-zinc-800 flex items-center gap-4"
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
          <div>
            <p className="font-bold text-lg dark:text-white">{displayBook.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Added to your permanent library</span>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="space-y-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.15 }}
              className={`flex items-start gap-4 p-4 ${feature.bg} rounded-xl border ${feature.border}`}
            >
              <div className="shrink-0 mt-0.5">{feature.icon}</div>
              <div className="text-left">
                <h3 className={`font-bold ${feature.text}`}>{feature.title}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enjoy Reading Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-4"
        >
          <p className="text-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Enjoy Reading! 📚
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoToBook}
          className="w-full py-4 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl font-bold text-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-xl flex items-center justify-center gap-2"
        >
          <BookOpen className="w-5 h-5" />
          Go to My Book
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
}