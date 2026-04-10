'use client'

import { useState, useContext, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User, ShoppingBag, Heart, Settings, LogOut, ChevronDown } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Context } from "@/context/userContext.js"
import { toast } from 'react-hot-toast'
import { useRouter, usePathname } from 'next/navigation'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { user, setUserDetails } = useContext(Context)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()

  // Track scroll for header styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const getAvatarColor = (letter) => {
    if (!letter) return "bg-gradient-to-br from-slate-500 to-slate-600"
    const colors = [
      "from-red-500 to-rose-600", 
      "from-orange-500 to-amber-600", 
      "from-green-500 to-emerald-600",
      "from-teal-500 to-cyan-600",
      "from-blue-500 to-indigo-600", 
      "from-violet-500 to-purple-600", 
      "from-fuchsia-500 to-pink-600"
    ]
    return `bg-gradient-to-br ${colors[letter.toUpperCase().charCodeAt(0) % colors.length]}`
  }

  const firstLetter = user?.name?.[0]?.toUpperCase()
  const isAdmin = user?.role === "admin"

  const handleLogout = async () => {
    const token = localStorage.getItem("token") || ""
    try {
      const response = await fetch(`${backendUrl}/user/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        setUserDetails(null)
        setProfileOpen(false)
        setIsOpen(false)
        toast.success(data.message || "Logged out successfully")
        router.push('/login')
      } else {
        toast.error(data.message || "Logout failed")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Books" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border' : 'bg-background border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo Section */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                <div className="w-9 h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                  <span className="font-bold text-primary-foreground text-lg md:text-xl">✨</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                    Christianity Crossroads
                  </h1>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden md:block">
                    Sacred Collection of Faith
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`relative text-sm lg:text-base font-medium transition-colors hover:text-primary group ${
                    pathname === link.href ? 'text-primary' : 'text-foreground/80'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                    pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
            </nav>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <ThemeToggle />
              
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 lg:gap-3 pl-1 pr-2 lg:pr-3 py-1 rounded-full hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border"
                  >
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full text-white font-bold text-sm lg:text-base shadow-md ${getAvatarColor(firstLetter)}`}>
                      {firstLetter}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold leading-tight max-w-[120px] truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* FIXED: Changed bg-popover to bg-white for large screen dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 border border-border rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-border bg-gray-50 dark:bg-gray-800 rounded-t-xl">
                        <p className="font-bold text-base text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <Link href="/manageProfile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <User className="w-4 h-4" />
                          Manage Profile
                        </Link>
                        <Link href="/wishlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <Heart className="w-4 h-4" />
                          My Wishlist
                        </Link>
                        <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                          My Orders
                        </Link>
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-border">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="px-4 lg:px-6 py-2 lg:py-2.5 text-sm lg:text-base font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Right Section */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button 
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                aria-label="Open menu"
              >
                <Menu size={24} className="text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer - FIXED: Added safe area and proper scrolling */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Drawer Panel - FIXED: Added max-h and safe area padding */}
        <div 
          ref={mobileMenuRef}
          className={`absolute top-0 right-0 h-full w-[85vw] max-w-[360px] bg-background shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <span className="font-bold text-lg">Menu</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Close menu"
            >
              <X size={24} className="text-foreground" />
            </button>
          </div>

          {/* FIXED: Proper flex layout with scrollable content */}
          <div className="flex flex-col h-[calc(100%-65px)]">
            
            {/* Scrollable Content Area - FIXED: Added pb-20 for logout space */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
              
              {/* User Profile Card */}
              {user ? (
                <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-4 border border-border shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold text-xl shadow-lg ${getAvatarColor(firstLetter)}`}>
                      {firstLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isAdmin ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-primary/10 text-primary'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-6 text-center border border-border">
                  <p className="text-muted-foreground mb-3">Welcome Guest</p>
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="inline-block w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Login to Continue
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Menu</p>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      pathname === link.href 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-foreground hover:bg-accent'
                    }`}
                  >
                    {link.label}
                    {pathname === link.href && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </Link>
                ))}
              </nav>

              {/* User Actions */}
              {user && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Account</p>
                  
                  {isAdmin && (
                    <Link 
                      href="/admin/dashboard" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <Link 
                    href="/manageProfile" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base text-foreground hover:bg-accent transition-colors"
                  >
                    <User className="w-5 h-5 text-muted-foreground" />
                    Manage Profile
                  </Link>
                  <Link 
                    href="/wishlist" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base text-foreground hover:bg-accent transition-colors"
                  >
                    <Heart className="w-5 h-5 text-muted-foreground" />
                    My Wishlist
                  </Link>
                  <Link 
                    href="/orders" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base text-foreground hover:bg-accent transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    My Orders
                  </Link>
                  <Link 
                    href="/settings" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base text-foreground hover:bg-accent transition-colors"
                  >
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    Settings
                  </Link>
                </div>
              )}
            </div>

            {/* FIXED: Sticky Logout Button with safe area padding */}
            {user && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background pb-safe">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl text-base font-bold text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}