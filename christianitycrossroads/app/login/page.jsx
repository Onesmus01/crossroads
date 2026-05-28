'use client'

import React, { useState, useContext, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF } from 'react-icons/fa'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { LogIn, UserPlus, ArrowLeft, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'          // ADDED
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

  useEffect(() => {
    const redirect = searchParams.get('redirect')
    if (redirect) {
      sessionStorage.setItem('redirectAfterLogin', redirect)
    }
  }, [searchParams])

  // ─── ADDED: Load Facebook SDK ───
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.FB) {
      window.fbAsyncInit = function () {
        FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0',
        })
      }
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }
  }, [])

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
    if (showSignupModal) setShowSignupModal(false)
  }

  // ─── ADDED: Shared social handler (same flow as normal login) ───
  const handleSocialSuccess = async (endpoint, payload) => {
    try {
      const res = await fetch(`${backendUrl}/user/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const responseData = await res.json()

      if (responseData.success && responseData.token) {
        localStorage.setItem('token', responseData.token)
        await fetchUserDetails()
        toast.success(responseData.message || 'Welcome! 🎉')

        const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
        const returnToPayment = sessionStorage.getItem('returnToPayment')
        
        if (returnToPayment === 'true') {
          router.push(redirectUrl || '/')
        } else if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterLogin')
          router.push(redirectUrl)
        } else {
          router.push('/')
        }
      } else {
        toast.error(responseData.message || 'Social login failed')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong!')
    }
  }

  // ─── ADDED: Google handler ───
  const handleGoogle = (credentialResponse) => {
    handleSocialSuccess('google', { credential: credentialResponse.credential })
  }

  // ─── ADDED: Facebook handler ───
  const handleFacebook = () => {
    if (!window.FB) {
      toast.error('Facebook SDK not loaded')
      return
    }
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const { accessToken, userID } = response.authResponse
          handleSocialSuccess('facebook', { accessToken, userID })
        } else {
          toast.error('Facebook login cancelled')
        }
      },
      { scope: 'email,public_profile' }
    )
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
    <section className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-8 relative">
      
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

      <AnimatePresence>
        {showSignupModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6 sm:p-8 shadow-xl max-w-sm w-full pointer-events-auto relative">
              
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="text-center space-y-4">
                <div className="w-14 h-14 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                  <UserPlus className="w-7 h-7 text-gray-600 dark:text-gray-400" />
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    Account not found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                    We couldn't find an account with that email. Create one now to continue.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={navigateToSignup}
                    className="w-full py-3 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </button>
                  
                  <button
                    onClick={tryDifferentCredentials}
                    className="py-2.5 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Try Different Email
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: showSignupModal ? 0.3 : 1, 
          y: 0,
          scale: showSignupModal ? 0.98 : 1
        }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-[420px] ${showSignupModal ? 'pointer-events-none' : ''}`}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="bg-zinc-900 dark:bg-zinc-950 px-5 pt-6 pb-8 sm:px-8 sm:pt-8 sm:pb-10 text-center relative">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 relative"
            >
              <Image 
                src={user} 
                alt="User" 
                className="rounded-full shadow-lg border-2 border-zinc-700"
                fill
                style={{ objectFit: 'cover' }}
              />
            </motion.div>
            
            <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">
              Welcome Back
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm">
              Sign in to your account
            </p>
          </div>

          <div className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={data.email}
                  onChange={handleOnChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400 pr-10 sm:pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? 
                      <AiOutlineEyeInvisible size={18} /> : 
                      <AiOutlineEye size={18} />
                    }
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !data.email || !data.password}
                className="w-full py-3 sm:py-4 mt-1 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white dark:border-zinc-400/30 dark:border-t-zinc-900 rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    Sign In
                  </>
                )}
              </motion.button>

              <div className="relative my-4 sm:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white dark:bg-zinc-900 text-gray-400">
                    or continue with
                  </span>
                </div>
              </div>

              {/* ─── SOCIAL LOGIN SECTION (only part that changed) ─── */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {/* REPLACED: Google button → GoogleLogin component */}
                <div className="min-h-[44px] flex items-center justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogle}
                    onError={() => toast.error('Google login failed')}
                    width="100%"
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                  />
                </div>
                
                {/* ADDED: onClick to existing Facebook button */}
                <button
                  type="button"
                  onClick={handleFacebook}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <FaFacebookF size={18} className="text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
                </button>
              </div>

              <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-1 sm:pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={navigateToSignup}
                  className="font-medium text-zinc-900 dark:text-white hover:underline transition-colors"
                >
                  Create one
                </button>
              </p>
            </form>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to home
          </Link>
        </div>
      </motion.div>
    </section>
  )
}