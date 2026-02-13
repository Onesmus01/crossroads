'use client'

import { useState, useContext, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Context } from "@/context/userContext.js"
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const { user, setUserDetails } = useContext(Context)
  const dropdownRef = useRef(null)
  const router = useRouter()

  /* ---------------- Close Dropdown Outside Click ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /* ---------------- Avatar Color ---------------- */
  const getAvatarColor = (letter) => {
    if (!letter) return "bg-slate-600"
    const colors = [
      "bg-red-500","bg-orange-500","bg-amber-500","bg-yellow-500",
      "bg-green-500","bg-emerald-500","bg-teal-500","bg-cyan-500",
      "bg-sky-500","bg-blue-500","bg-indigo-500","bg-violet-500",
      "bg-purple-500","bg-fuchsia-500","bg-pink-500","bg-rose-500",
    ]
    return colors[letter.toUpperCase().charCodeAt(0) % colors.length]
  }

  const firstLetter = user?.name?.[0]?.toUpperCase()

  /* ---------------- Logout ---------------- */
  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendUrl}/user/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await response.json()

      if (response.ok) {
        setUserDetails(null)
        setProfileOpen(false)
        toast.success(data.message || "Logged out successfully")
        router.push('/login')
      } else {
        toast.error(data.message || "Logout failed")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

        {/* ---------------- Logo ---------------- */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="font-bold text-primary-foreground">✨</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Christianity Crossroads</h1>
            <p className="text-xs text-muted-foreground">
              Sacred Collection of Faith
            </p>
          </div>
        </div>

        {/* ---------------- Desktop Nav ---------------- */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition">Home</Link>
          <Link href="/books" className="hover:text-primary transition">Books</Link>
          <Link href="/about" className="hover:text-primary transition">About</Link>
          <Link href="/contact" className="hover:text-primary transition">Contact</Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar */}
              <div
                onClick={() => setProfileOpen((prev) => !prev)}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold cursor-pointer hover:scale-105 transition ${getAvatarColor(firstLetter)}`}
              >
                {firstLetter}
              </div>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-background border border-border rounded-xl shadow-lg p-2 space-y-1 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>

                  {user.role === "admin" && (
                    <Link href="/admin" className="block px-3 py-2 rounded-md hover:bg-muted transition">
                      Admin Dashboard
                    </Link>
                  )}

                  <Link href="/manageProfile" className="block px-3 py-2 rounded-md hover:bg-muted transition">
                    Manage Profile
                  </Link>
                  <Link href="/wishlist" className="block px-3 py-2 rounded-md hover:bg-muted transition">
                    My Wishlist
                  </Link>
                  <Link href="/orders" className="block px-3 py-2 rounded-md hover:bg-muted transition">
                    My Orders
                  </Link>
                  <Link href="/settings" className="block px-3 py-2 rounded-md hover:bg-muted transition">
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-red-100 text-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition">
              Login
            </Link>
          )}

          <ThemeToggle />
        </nav>

        {/* ---------------- Mobile Toggle ---------------- */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ---------------- Mobile Menu ---------------- */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-6 space-y-3 animate-in fade-in">

          {/* ---------------- Mobile User Info ---------------- */}
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 border-b border-border">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-semibold ${getAvatarColor(firstLetter)}`}>
                {firstLetter}
              </div>
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">📧 {user.email}</p>
              </div>
            </div>
          )}

          {/* ---------------- Main Links ---------------- */}
          <Link href="/" className="block py-2 px-2 rounded-md hover:bg-muted transition">Home</Link>
          <Link href="/books" className="block py-2 px-2 rounded-md hover:bg-muted transition">Books</Link>
          <Link href="/about" className="block py-2 px-2 rounded-md hover:bg-muted transition">About</Link>
          <Link href="/contact" className="block py-2 px-2 rounded-md hover:bg-muted transition">Contact</Link>

          {user ? (
            <>
              {user.role === "admin" && <Link href="/admin" className="block py-2 px-2 rounded-md hover:bg-muted transition">Admin Dashboard</Link>}
              <Link href="/manageProfile" className="block py-2 px-2 rounded-md hover:bg-muted transition">Manage Profile</Link>
              <Link href="/wishlist" className="block py-2 px-2 rounded-md hover:bg-muted transition">My Wishlist</Link>
              <Link href="/orders" className="block py-2 px-2 rounded-md hover:bg-muted transition">My Orders</Link>
              <Link href="/settings" className="block py-2 px-2 rounded-md hover:bg-muted transition">Settings</Link>
              <button onClick={handleLogout} className="block w-full text-left py-2 px-2 rounded-md text-red-600 hover:bg-red-100 transition">Logout</button>
            </>
          ) : (
            <Link href="/login" className="block mt-2 py-2 px-2 rounded-md bg-primary text-primary-foreground text-center hover:opacity-90 transition">
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
