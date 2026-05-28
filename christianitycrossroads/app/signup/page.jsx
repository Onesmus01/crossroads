'use client'

import { useState, useEffect, useContext } from 'react'          // ADDED useContext
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF } from 'react-icons/fa'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { UserPlus, ArrowLeft, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'
import { Context } from "@/context/userContext.js"              // ADDED
import ImageToBase64 from '@/helpers/ImageToBase64.jsx'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

export default function SignUp() {
  const router = useRouter()
  const { fetchUserDetails } = useContext(Context)              // ADDED

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePic: '',
  })

  const [photo, setPhoto] = useState('')

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return

    const base64 = await ImageToBase64(file)
    setPhoto(base64)
    setData((prev) => ({ ...prev, profilePic: base64 }))
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target
    setData((prev) => ({ ...prev, [name]: value }))
  }

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
        await fetchUserDetails()                              // ADDED
        toast.success(responseData.message || 'Welcome! 🎉')
        router.push('/')
      } else {
        toast.error(responseData.message || 'Social signup failed')
      }
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong!')
    }
  }

  const handleGoogle = (credentialResponse) => {
    handleSocialSuccess('google', { credential: credentialResponse.credential })
  }

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

    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    if (data.password.length < 6) {
      toast.error('Password must be at least 6 characters!')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${backendUrl}/user/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          profilePic: data.profilePic,
        }),
      })

      const responseData = await res.json()

      if (res.ok) {
        sessionStorage.setItem('signupEmail', data.email)
        sessionStorage.setItem('signupPassword', data.password)
        sessionStorage.setItem('fromSignup', 'true')

        toast.success(
          responseData.message || 'Welcome to our community! 🎉',
          { icon: '✅', duration: 3000 }
        )

        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        toast.error(responseData.message || 'Signup failed!')
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('Something went wrong!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-[420px]">
        
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-zinc-900 dark:bg-zinc-950 px-5 pt-6 pb-8 sm:px-8 sm:pt-8 sm:pb-10 text-center relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="relative z-10"
            >
              {/* Profile Photo Upload */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 relative">
                <label className="w-full h-full cursor-pointer rounded-full border-2 border-zinc-600 overflow-hidden shadow-lg block relative group bg-zinc-800">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                      <Camera className="w-6 h-6 sm:w-7 sm:h-7 mb-0.5" />
                      <span className="text-[10px] sm:text-xs">Add Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-semibold text-white mb-1">
                Create Account
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Sign up to get started
              </p>
            </motion.div>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              
              {/* Name Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={data.name}
                  onChange={handleOnChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={handleOnChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={data.password}
                    onChange={handleOnChange}
                    placeholder="Create a strong password"
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400 pr-10 sm:pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <AiOutlineEyeInvisible size={18} />
                    ) : (
                      <AiOutlineEye size={18} />
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={data.confirmPassword}
                    onChange={handleOnChange}
                    placeholder="Confirm your password"
                    required
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-sm text-gray-900 dark:text-white placeholder:text-gray-400 pr-10 sm:pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEyeInvisible size={18} />
                    ) : (
                      <AiOutlineEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !data.name || !data.email || !data.password || !data.confirmPassword}
                className="w-full py-3 sm:py-4 mt-2 bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white font-semibold rounded-lg hover:bg-zinc-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white dark:border-zinc-400/30 dark:border-t-zinc-900 rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Create Account
                  </>
                )}
              </motion.button>

              {/* Divider */}
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

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="min-h-[44px] flex items-center justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogle}
                    onError={() => toast.error('Google signup failed')}
                    width="100%"
                    theme="outline"
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleFacebook}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <FaFacebookF size={18} className="text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Facebook
                  </span>
                </button>
              </div>

              {/* Login Link */}
              <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-1 sm:pt-2">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-zinc-900 dark:text-white hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="mt-4 sm:mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to home
          </Link>
        </div>
      </div>
    </section>
  )
}