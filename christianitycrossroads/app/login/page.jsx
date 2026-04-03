'use client'

import React, { useState, useContext, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF } from 'react-icons/fa'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { LogIn, UserPlus, Heart, ArrowLeft, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Context } from "@/context/userContext.js"
import user from '@/public/images/user.png'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api"

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchUserDetails } = useContext(Context)

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showGuestPopup, setShowGuestPopup] = useState(false)
  const [data, setData] = useState({
    email: "",
    password: "",
  })

  // Check for signup data from sessionStorage (after signup redirect)
  useEffect(() => {
    const signupEmail = sessionStorage.getItem('signupEmail')
    const signupPassword = sessionStorage.getItem('signupPassword')
    const fromSignup = sessionStorage.getItem('fromSignup')
    
    if (signupEmail && fromSignup === 'true') {
      setData({
        email: signupEmail,
        password: signupPassword || ''
      })
      
      // Clear the flags
      sessionStorage.removeItem('signupEmail')
      sessionStorage.removeItem('signupPassword')
      sessionStorage.removeItem('fromSignup')
      
      toast.success('Account created! Please login with your credentials.', { 
        icon: '✅',
        duration: 5000 
      })
    }
  }, [])

  // Handle redirect after login (for payment flow)
  useEffect(() => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      sessionStorage.setItem('redirectAfterLogin', redirect)
    }
  }, [searchParams])

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
    if (showGuestPopup) setShowGuestPopup(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`${backendUrl}/user/signin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      })

      const responseData = await res.json()

      // Wrong credentials or account not found
      if (!res.ok) {
        // Show beloved guest popup for any login failure
        setShowGuestPopup(true)
        toast.error("Login failed", { icon: '❌' })
        setIsLoading(false)
        return
      }

      if (responseData.token) {
        localStorage.setItem("token", responseData.token)
        await fetchUserDetails()
        
        toast.success("Welcome back! 🎉", { icon: '✅' })

        // Handle redirect after login
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
        const returnToPayment = sessionStorage.getItem('returnToPayment')
        
        if (returnToPayment === 'true') {
          router.push(redirectUrl || '/')
        } else if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin')
          router.push(redirectUrl)
        } else {
          router.push("/")
        }
      } else {
        toast.error("Authentication error")
      }

    } catch (error) {
      console.error("Login error:", error)
      toast.error("Something went wrong!")
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToSignup = () => {
    // Preserve redirect if exists
    const redirect = searchParams.get('redirect')
    const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
    router.push(`/signup${query}`)
  }

  const tryDifferentCredentials = () => {
    setShowGuestPopup(false)
    setData({ email: "", password: "" })
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 px-4 py-8">
      <div className="w-full max-w-md">
        
        {/* Beloved Guest Popup */}
        <AnimatePresence>
          {showGuestPopup && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mb-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/10 border-2 border-rose-200 dark:border-rose-800 rounded-3xl p-6 shadow-lg relative overflow-hidden"
            >
              {/* Decorative sparkle */}
              <div className="absolute top-3 right-3 text-rose-300 dark:text-rose-700">
                <Sparkles className="w-5 h-5" />
              </div>
              
              <div className="text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-16 h-16 bg-rose-100 dark:bg-rose-800/30 rounded-full flex items-center justify-center mx-auto"
                >
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                </motion.div>
                
                <div>
                  <h3 className="text-lg font-bold text-rose-800 dark:text-rose-200">
                    Dear Our Beloved Guest 💝
                  </h3>
                  <p className="text-rose-700 dark:text-rose-300 mt-2 text-sm leading-relaxed">
                    It seems that you don't have an account with us yet, 
                    or your credentials may be incorrect. Please create an account 
                    to enjoy our sacred collection!
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={navigateToSignup}
                    className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={tryDifferentCredentials}
                    className="py-2.5 text-rose-600 dark:text-rose-400 font-medium text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Try Different Credentials
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-4 relative"
            >
              <Image 
                src={user} 
                alt="User" 
                className="rounded-full shadow-2xl border-4 border-white/30"
                fill
                style={{ objectFit: 'cover' }}
              />
            </motion.div>
            
            <h1 className="text-2xl font-bold text-white mb-1 relative z-10">
              Welcome Back
            </h1>
            <p className="text-white/80 text-sm relative z-10">
              Sign in to continue your spiritual journey
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={handleOnChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-gray-800 dark:text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={data.password}
                    onChange={handleOnChange}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-gray-800 dark:text-white placeholder:text-gray-400 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? 
                      <AiOutlineEyeInvisible size={20} /> : 
                      <AiOutlineEye size={20} />
                    }
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading || !data.email || !data.password}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-zinc-900 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <FcGoogle size={20} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <FaFacebookF size={20} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={navigateToSignup}
                  className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Create one
                </button>
              </p>
            </form>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}