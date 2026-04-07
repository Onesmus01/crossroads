'use client'

import React, { useState, useContext, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF } from 'react-icons/fa'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { LogIn, UserPlus, Heart, ArrowLeft, Sparkles, X } from 'lucide-react'
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
  const [showSignupModal, setShowSignupModal] = useState(false)
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
    if (showSignupModal) setShowSignupModal(false)
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

      if (!res.ok) {
        // User doesn't exist or wrong credentials - show centered signup modal
        setShowSignupModal(true)
        toast.error("Account not found", { icon: '❌' })
        setIsLoading(false)
        return
      }

      if (responseData.token) {
        localStorage.setItem("token", responseData.token)
        await fetchUserDetails()
        
        toast.success("Welcome back! 🎉", { icon: '✅' })

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
    const redirect = searchParams.get('redirect')
    const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
    router.push(`/signup${query}`)
  }

  const tryDifferentCredentials = () => {
    setShowSignupModal(false)
    setData({ email: "", password: "" })
  }

  const closeModal = () => {
    setShowSignupModal(false)
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 px-4 py-8 relative">
      
      {/* BACKDROP OVERLAY - Darkens the login page when modal shows */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={closeModal}
          />
        )}
      </AnimatePresence>

      {/* CENTERED SIGNUP MODAL - Pops up in the middle of screen */}
      <AnimatePresence>
        {showSignupModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-zinc-800 dark:to-zinc-900 border-2 border-rose-200 dark:border-rose-800 rounded-3xl p-8 shadow-2xl max-w-md w-full pointer-events-auto relative">
              
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-2 text-rose-400 hover:text-rose-600 dark:text-rose-500 dark:hover:text-rose-300 transition-colors rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/30"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative sparkle */}
              <div className="absolute top-4 left-4 text-rose-300 dark:text-rose-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="absolute top-4 right-12 text-rose-300 dark:text-rose-600">
                <Sparkles className="w-4 h-4" />
              </div>
              
              <div className="text-center space-y-5">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-20 h-20 bg-rose-100 dark:bg-rose-800/30 rounded-full flex items-center justify-center mx-auto"
                >
                  <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
                </motion.div>
                
                <div>
                  <h3 className="text-2xl font-bold text-rose-800 dark:text-rose-200">
                    Welcome, Beloved Guest! 💝
                  </h3>
                  <p className="text-rose-700 dark:text-rose-300 mt-3 text-base leading-relaxed">
                    We couldn't find an account with that email. 
                    Create one now to access our sacred collection of books!
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={navigateToSignup}
                    className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 dark:shadow-none flex items-center justify-center gap-2 text-lg"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create Account Now
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={tryDifferentCredentials}
                    className="py-3 text-rose-600 dark:text-rose-400 font-medium text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Try Different Email
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Login Card - Dims when modal is open */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showSignupModal ? 0.3 : 1, 
          y: 0,
          scale: showSignupModal ? 0.95 : 1
        }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-md ${showSignupModal ? 'pointer-events-none' : ''}`}
      >
        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-500 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />            
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
        </div>

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
      </motion.div>
    </section>
  )
}