'use client';

import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, Loader2, AlertCircle, LogIn, BookOpen, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Context } from '@/context/userContext';

interface Book {
  id: string;
  title: string;
  price: number;
  coverImage?: string;
}

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onSuccess?: () => void;
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  checkoutRequestId?: string;
  transaction_id?: string;
  error?: string;
  alreadyPurchased?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';

export function MpesaPaymentModal({ isOpen, onClose, book, onSuccess }: MpesaPaymentModalProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'login-required'>('phone');
  const [error, setError] = useState('');
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  
  const router = useRouter();
  const { user } = useContext(Context);

  // Check for return from login
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const returnToPayment = sessionStorage.getItem('returnToPayment');
      const pendingBook = sessionStorage.getItem('pendingBook');
      
      if (returnToPayment === 'true' && pendingBook && isOpen) {
        const bookData = JSON.parse(pendingBook);
        if (bookData.id === book?.id) {
          setJustLoggedIn(true);
          setStep('phone');
          toast.success('Well done! You can pay now.', { icon: '✅', duration: 4000 });
          sessionStorage.removeItem('returnToPayment');
          sessionStorage.removeItem('pendingBook');
          setTimeout(() => setJustLoggedIn(false), 3000);
        }
      }
    }
  }, [isOpen, book]);

  // Check auth when modal opens
  useEffect(() => {
    if (isOpen && book) {
      if (!user) {
        setStep('login-required');
      } else {
        setStep('phone');
      }
    }
  }, [isOpen, book, user]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setError('');
      setStep('phone');
      setJustLoggedIn(false);
    }
  }, [isOpen]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  };

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const validatePhone = (phone: string): string | null => {
    let formatted = phone.replace(/\s/g, '');
    if (formatted.startsWith('0')) {
      formatted = '254' + formatted.substring(1);
    }
    if (!formatted.startsWith('254') || formatted.length !== 12) {
      return null;
    }
    return formatted;
  };

  const handleLoginRedirect = () => {
    sessionStorage.setItem('returnToPayment', 'true');
    sessionStorage.setItem('pendingBook', JSON.stringify(book));
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    onClose();
    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setStep('login-required');
      return;
    }

    const formattedPhone = validatePhone(phone);
    if (!formattedPhone) {
      setError('Please enter a valid M-Pesa number (e.g., 0712 345 678)');
      return;
    }

    setLoading(true);

    try {
      const token = getAuthToken();
      
      const res = await fetch(`${API_BASE_URL}/payment/mpesa/pay`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: book?.price,
          bookId: book?.id,
          bookTitle: book?.title,
        }),
      });

      const data: PaymentResponse = await res.json();

      // ─── HANDLE ALREADY PURCHASED (backend may send as success OR error) ─
      const isAlreadyPurchased = 
        data.alreadyPurchased === true ||
        data.error?.toLowerCase().includes('already purchased') || 
        data.message?.toLowerCase().includes('already purchased');

      if (isAlreadyPurchased) {
        toast.success('You already own this book!', { icon: '✅', duration: 4000 });
        // Clean up any stale payment session
        sessionStorage.removeItem('mpesaPayment');
        onSuccess?.();
        onClose();
        router.push(`/bookDetails/${book?.id}`);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Payment initiation failed');
      }

      const checkoutId = data.checkoutRequestId || data.transaction_id;
      if (!checkoutId) {
        throw new Error('Invalid response: No transaction ID received');
      }

      // Store payment session for verify page
      sessionStorage.setItem('mpesaPayment', JSON.stringify({
        checkoutId,
        book,
        timestamp: Date.now(),
      }));

      toast.success(data.message || 'STK Push sent! Check your phone.', {
        duration: 5000,
        icon: '📱',
      });

      onSuccess?.();
      onClose();
      router.push(`/payment/verify?bookId=${book?.id}`);

    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
      toast.error(err.message || 'Payment failed', { icon: '❌' });
    }
  };

  const handleClose = () => {
    // Clean up stale payment session if user manually closes
    sessionStorage.removeItem('mpesaPayment');
    onClose();
  };

  if (!isOpen || !book) return null;

  return (
    <AnimatePresence mode="wait">
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
              <button
                onClick={handleClose}
                disabled={loading}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={book.title}
                    className="w-16 h-20 object-cover rounded-lg shadow-lg bg-white/10"
                  />
                ) : (
                  <div className="w-16 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">{book.title.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-100 text-sm font-medium">Paying for</p>
                  <h3 className="font-bold text-lg line-clamp-1">{book.title}</h3>
                  <p className="text-2xl font-bold mt-1">KES {book.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 'login-required' && (
                  <motion.div
                    key="login-required"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-8 text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto"
                    >
                      <LogIn className="w-10 h-10 text-amber-600" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold text-xl dark:text-white">Login Required</h4>
                      <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                        Please login first to complete your purchase of <span className="font-semibold">"{book.title}"</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLoginRedirect}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <LogIn className="w-5 h-5" />
                        Login to Continue
                      </motion.button>
                      
                      <button
                        onClick={handleClose}
                        className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-4"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                      <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-300 text-left">
                        Don't worry! After logging in, you'll be redirected back here automatically.
                      </p>
                    </div>
                  </motion.div>
                )}

                {step === 'phone' && (
                  <motion.form
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {justLoggedIn && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-200"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">Well done! You can pay now.</span>
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        M-Pesa Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(formatPhone(e.target.value))}
                          placeholder="0712 345 678"
                          maxLength={13}
                          disabled={loading}
                          className="w-full pl-12 pr-4 py-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-2 border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-lg font-medium disabled:opacity-50 outline-none"
                          autoFocus
                        />
                      </div>
                      
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 flex items-start gap-2 text-sm text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg"
                        >
                          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                      
                      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                        Enter your M-Pesa registered number. You'll receive an STK push notification.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">
                        Secured by Safaricom M-Pesa. Your transaction is encrypted.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phone.replace(/\s/g, '').length < 10}
                      className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-[0.98]"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending Request...
                        </span>
                      ) : (
                        `Pay KES ${book.price.toLocaleString()}`
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}