'use client';

import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Shield, Loader2, CheckCircle, AlertCircle, LogIn, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Context } from '@/context/userContext';
import Link from 'next/link';

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
  onSuccess: () => void;
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  checkoutRequestId?: string;
  transaction_id?: string;
  error?: string;
}

interface StatusResponse {
  success: boolean;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  resultDesc?: string;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';
const POLLING_INTERVAL = 3000;
const MAX_POLLING_ATTEMPTS = 40;

export function MpesaPaymentModal({ isOpen, onClose, book, onSuccess }: MpesaPaymentModalProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'processing' | 'success' | 'login-required'>('phone');
  const [error, setError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const attemptsRef = useRef(0);
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
          // Clear the flags
          sessionStorage.removeItem('returnToPayment');
          sessionStorage.removeItem('pendingBook');
          
          // Auto-hide the "well done" message after 3 seconds
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

  // Cleanup on unmount or close
  useEffect(() => {
    return () => stopPolling();
  }, []);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPhone('');
      setError('');
      setStep('phone');
      setCheckoutRequestId('');
      setJustLoggedIn(false);
      attemptsRef.current = 0;
    }
  }, [isOpen]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    attemptsRef.current = 0;
  }, []);

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
    // Store intent to return to payment
    sessionStorage.setItem('returnToPayment', 'true');
    sessionStorage.setItem('pendingBook', JSON.stringify(book));
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    
    onClose();
    router.push('/login');
  };

  const checkPaymentStatus = useCallback(async (checkoutId: string): Promise<boolean> => {
    try {
      const token = getAuthToken();
      abortControllerRef.current = new AbortController();
      
      const res = await fetch(`${API_BASE_URL}/payment/mpesa/status/${checkoutId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Status check failed`);
      }
      
      const data: StatusResponse = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Status check returned unsuccessful');
      }

      const status = data.status?.toLowerCase();
      
      if (status === 'success') {
        stopPolling();
        setStep('success');
        toast.success('Payment confirmed! Book unlocked.', { icon: '🎉', duration: 5000 });
        onSuccess();
        return true;
      } 
      
      if (status === 'failed' || status === 'cancelled') {
        stopPolling();
        setError(data.resultDesc || `Payment ${status}. Please try again.`);
        setStep('phone');
        setLoading(false);
        toast.error(data.resultDesc || `Payment ${status}`, { icon: '❌' });
        return true;
      }
      
      return false;
      
    } catch (err: any) {
      if (err.name === 'AbortError') return false;
      console.error('Status check error:', err);
      return false;
    }
  }, [onSuccess, stopPolling]);

  const startPolling = useCallback((checkoutId: string) => {
    attemptsRef.current = 0;
    checkPaymentStatus(checkoutId);
    
    pollIntervalRef.current = setInterval(async () => {
      attemptsRef.current++;
      
      if (attemptsRef.current >= MAX_POLLING_ATTEMPTS) {
        stopPolling();
        setError('Payment confirmation timed out. Please check your M-Pesa messages and refresh if needed.');
        setStep('phone');
        setLoading(false);
        toast.error('Payment timed out. Check your M-Pesa messages.', { icon: '⏰', duration: 6000 });
        return;
      }

      const shouldStop = await checkPaymentStatus(checkoutId);
      if (shouldStop) return;
      
    }, POLLING_INTERVAL);
  }, [checkPaymentStatus, stopPolling]);

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
    setStep('processing');

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

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Payment initiation failed');
      }

      const checkoutId = data.checkoutRequestId || data.transaction_id;
      
      if (!checkoutId) {
        throw new Error('Invalid response: No transaction ID received');
      }

      setCheckoutRequestId(checkoutId);
      toast.success(data.message || 'STK Push sent! Check your phone.', {
        duration: 5000,
        icon: '📱',
      });
      
      startPolling(checkoutId);

    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('phone');
      setLoading(false);
      toast.error(err.message || 'Payment failed', { icon: '❌' });
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      stopPolling();
      onClose();
      return;
    }
    
    if (loading && step === 'processing') {
      if (confirm('Payment is still processing. Close anyway? You will be notified via M-Pesa SMS once complete.')) {
        stopPolling();
        onClose();
      }
      return;
    }
    
    stopPolling();
    onClose();
  };

  if (!isOpen || !book) return null;

  return (
    <AnimatePresence mode="wait">
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />

        {/* Modal */}
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
                disabled={loading && step === 'processing'}
                className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                
                {/* LOGIN REQUIRED STEP */}
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
                        Please login first to complete your purchase of <span className="font-semibold text-foreground">"{book.title}"</span>
                      </p>
                    </div>

                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLoginRedirect}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 active:bg-emerald-800 transition-all shadow-lg shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2"
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
                        Don't worry! After logging in, you'll be redirected back here automatically to complete your payment.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* PHONE INPUT STEP */}
                {step === 'phone' && (
                  <motion.form
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Success message after login */}
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
                        Enter your M-Pesa registered number. You'll receive an STK push notification to complete payment.
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

                {/* PROCESSING STEP */}
                {step === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-8 text-center space-y-6"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto"
                    >
                      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                    </motion.div>
                    
                    <div className="space-y-2">
                      <h4 className="font-bold text-xl dark:text-white">Check your phone</h4>
                      <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                        We've sent an M-Pesa prompt to your phone. Enter your PIN to complete the payment.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className="bg-emerald-500 h-full rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: MAX_POLLING_ATTEMPTS * (POLLING_INTERVAL / 1000), ease: "linear" }}
                        />
                      </div>
                      <p className="text-xs text-zinc-400">
                        Waiting for confirmation... {checkoutRequestId && `(ID: ...${checkoutRequestId.slice(-6)})`}
                      </p>
                    </div>

                    <button
                      onClick={handleClose}
                      className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-4"
                    >
                      Cancel and close
                    </button>
                  </motion.div>
                )}

                {/* SUCCESS STEP */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="py-8 text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-200"
                    >
                      <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    <div className="space-y-1">
                      <h4 className="font-bold text-2xl text-emerald-600">Payment Successful!</h4>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        Transaction ID: <span className="font-mono font-medium">{checkoutRequestId.slice(-6)}</span>
                      </p>
                      <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-2">
                        Your book is now unlocked and ready to read
                      </p>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className="mt-6 px-8 py-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                    >
                      Start Reading
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}