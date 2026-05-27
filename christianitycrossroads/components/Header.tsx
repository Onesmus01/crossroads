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
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
    setProfileOpen(false)
  }, [pathname])

  const getAvatarColor = (letter) => {
    if (!letter) return "bg-zinc-500"
    const colors = [
      "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500",
      "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500",
      "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-rose-500"
    ]
    return colors[letter.toUpperCase().charCodeAt(0) % colors.length]
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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled 
          ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm' 
          : 'bg-white dark:bg-zinc-950 border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
                <span className="font-bold text-white dark:text-zinc-900 text-sm">CC</span>
              </div>
              <span className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
                Christianity Crossroads
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className={`relative px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === link.href 
                      ? 'text-zinc-900 dark:text-white' 
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-3 right-3 h-px bg-zinc-900 dark:bg-white" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                  >
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-white text-xs font-semibold ${getAvatarColor(firstLetter)}`}>
                      {firstLetter}
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-1.5 z-50">
                      <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                        <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                      </div>

                      <div className="space-y-0.5">
                        {isAdmin && (
                          <Link 
                            href="/admin/dashboard" 
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <Link href="/manageProfile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <Link href="/wishlist" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                          <Heart className="w-4 h-4" />
                          Wishlist
                        </Link>
                        <Link href="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                          Orders
                        </Link>
                        <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                      </div>

                      <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                >
                  Log in
                </Link>
              )}
            </div>

            {/* Mobile Right */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button 
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        
        <div className={`absolute top-0 right-0 h-full w-[80vw] max-w-[320px] bg-white dark:bg-zinc-950 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="font-semibold text-sm text-zinc-900 dark:text-white">Menu</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          <div className="flex flex-col h-[calc(100%-53px)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* User Section */}
              {user ? (
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-white font-bold text-sm ${getAvatarColor(firstLetter)}`}>
                    {firstLetter}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-zinc-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">{user.role}</p>
                  </div>
                </div>
              ) : (
                <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <Link 
                    href="/login" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium rounded-lg text-center hover:opacity-90 transition-opacity"
                  >
                    Log in
                  </Link>
                </div>
              )}

              {/* Nav Links */}
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      pathname === link.href 
                        ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {link.label}
                    {pathname === link.href && <span className="w-1 h-1 rounded-full bg-zinc-900 dark:bg-white" />}
                  </Link>
                ))}
              </nav>

              {/* Account Links */}
              {user && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider mb-1 px-3">Account</p>
                  
                  {isAdmin && (
                    <Link 
                      href="/admin/dashboard" 
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <Link href="/manageProfile" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link href="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Link>
                  <Link href="/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <ShoppingBag className="w-4 h-4" />
                    Orders
                  </Link>
                  <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </div>
              )}
            </div>

            {/* Sticky Logout */}
            {user && (
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}