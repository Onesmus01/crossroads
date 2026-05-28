'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StatusResponse {
  success: boolean;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  resultDesc?: string;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api';
const POLLING_INTERVAL = 3000;
const MAX_POLLING_ATTEMPTS = 40;

export default function VerifyPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  
  const [status, setStatus] = useState<'polling' | 'success' | 'failed'>('polling');
  const [message, setMessage] = useState('Check your phone for the M-Pesa prompt...');
  const [attempts, setAttempts] = useState(0);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const attemptsRef = useRef(0);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const getPaymentData = () => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem('mpesaPayment');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const checkStatus = useCallback(async (checkoutId: string): Promise<boolean> => {
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

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data: StatusResponse = await res.json();
      if (!data.success) throw new Error(data.message || 'Status check failed');

      const status = data.status?.toLowerCase();
      
      if (status === 'success') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        toast.success('Payment confirmed!', { icon: '🎉' });
        
        // ═════════════════════════════════════════════════════════════
        //  SECURITY: Set flag BEFORE redirect so downstream pages
        //  (ThankYou → Ownership → BookDetails) re-fetch from BACKEND.
        //  Never trust localStorage for ownership state.
        // ═════════════════════════════════════════════════════════════
        sessionStorage.setItem('paymentJustCompleted', 'true');
        
        router.push(`/payment/thank-you?bookId=${bookId}`);
        return true;
      }
      
      if (status === 'failed' || status === 'cancelled') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setStatus('failed');
        setMessage(data.resultDesc || `Payment ${status}. Please try again.`);
        toast.error(data.resultDesc || `Payment ${status}`);
        return true;
      }
      
      return false;
    } catch (err: any) {
      if (err.name === 'AbortError') return false;
      console.error('Status check error:', err);
      return false;
    }
  }, [bookId, router]);

  useEffect(() => {
    const paymentData = getPaymentData();
    if (!paymentData?.checkoutId) {
      setStatus('failed');
      setMessage('No pending payment found. Please try again.');
      return;
    }

    // Start polling
    attemptsRef.current = 0;
    checkStatus(paymentData.checkoutId);
    
    pollIntervalRef.current = setInterval(async () => {
      attemptsRef.current++;
      setAttempts(attemptsRef.current);
      
      if (attemptsRef.current >= MAX_POLLING_ATTEMPTS) {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setStatus('failed');
        setMessage('Payment confirmation timed out. Please check your M-Pesa messages.');
        toast.error('Payment timed out', { icon: '⏰' });
        return;
      }

      const shouldStop = await checkStatus(paymentData.checkoutId);
      if (shouldStop && pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }, POLLING_INTERVAL);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [checkStatus]);

  const handleGoBack = () => {
    if (bookId) {
      router.push(`/bookDetails/${bookId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center space-y-8"
      >
        {status === 'polling' && (
          <>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto"
            >
              <Loader2 className="w-14 h-14 text-emerald-600 animate-spin" />
            </motion.div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold dark:text-white">Verify Payment</h1>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                {message}
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-emerald-500 h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min((attempts / MAX_POLLING_ATTEMPTS) * 100, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                <Phone className="w-4 h-4" />
                <span>Waiting for M-Pesa confirmation...</span>
              </div>
            </div>

            <button
              onClick={handleGoBack}
              className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline underline-offset-4"
            >
              Cancel and go back
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto"
            >
              <AlertCircle className="w-12 h-12 text-rose-600" />
            </motion.div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold dark:text-white">Payment Failed</h1>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                {message}
              </p>
            </div>

            <button
              onClick={handleGoBack}
              className="w-full py-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back to Book
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}