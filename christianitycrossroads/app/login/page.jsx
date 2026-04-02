'use client'

import React, { useState, useContext } from 'react'
import Image from 'next/image'
import user from '@/public/images/user.png' // Next.js expects /public folder
import { FcGoogle } from 'react-icons/fc'
import { FaFacebookF } from 'react-icons/fa'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import {Context} from "@/context/userContext.js";

let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [data, setData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/user/signin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await res.json();
      console.log("Login response:", responseData);

      if (!res.ok) {
        toast.error(responseData.message || "Login failed!");
        return;
      }

      if (responseData.token) {
        localStorage.setItem("token", responseData.token);
        console.log("✅ Token saved to localStorage");
      } else {
        console.warn("⚠️ No token received from backend");
        toast.error("Authentication error: No token received");
        return;
      }

      toast.success(responseData.message || "Login successful!");

      
      router.push("/"); // Next.js navigation
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      id='login' 
      className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-50 font-sans px-3 sm:px-4 py-6 sm:py-8"
    >
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 relative">
            <Image 
              src={user} 
              alt='user' 
              className="rounded-full shadow-md" 
              fill
              style={{ objectFit: 'cover', borderRadius: '9999px' }}
            />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-gray-800">
            Login to Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm sm:text-base text-gray-700 mb-1 sm:mb-2 font-medium"
              >
                Email
              </label>
              <input
                type="email"
                name='email'
                value={data.email}
                onChange={handleOnChange}
                id="email"
                placeholder="Enter your email"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="relative">
              <label 
                htmlFor="password" 
                className="block text-sm sm:text-base text-gray-700 mb-1 sm:mb-2 font-medium"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name='password'
                  value={data.password}
                  onChange={handleOnChange}
                  placeholder="Enter your password"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 sm:pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-0 right-0 h-full w-10 sm:w-12 flex items-center justify-center rounded-r-lg hover:bg-gray-100 transition-colors text-gray-600"
                >
                  {showPassword ? 
                    <AiOutlineEyeInvisible size={18} className="sm:w-5 sm:h-5" /> : 
                    <AiOutlineEye size={18} className="sm:w-5 sm:h-5" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 sm:py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 active:bg-blue-800 transition-colors mt-2 text-sm sm:text-base shadow-md active:transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-5 sm:mt-6">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-300 rounded-full px-4 py-2.5 sm:py-2 hover:bg-gray-100 transition-colors text-sm sm:text-base">
              <FcGoogle size={18} className="sm:w-5 sm:h-5" /> 
              <span>Google</span>
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-gray-300 rounded-full px-4 py-2.5 sm:py-2 hover:bg-blue-50 transition-colors text-blue-600 text-sm sm:text-base">
              <FaFacebookF size={18} className="sm:w-5 sm:h-5" /> 
              <span>Facebook</span>
            </button>
          </div>

          <div className="mt-5 sm:mt-6 space-y-2">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              Forgot your password?{' '}
              <Link href="/forgot-password" className="text-blue-600 hover:underline font-medium">
                Reset
              </Link>
            </p>

            <p className="text-center text-xs sm:text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login