'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground">✨</span>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Christianity Crossroads
            </h1>
            <p className="text-xs text-muted-foreground">
              Sacred Collection of Faith
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <Link href="/books" className="hover:text-primary transition">
            Books
          </Link>
          <Link href="/about" className="hover:text-primary transition">
            About
          </Link>
          <Link href="/contact" className="hover:text-primary transition">
            Contact
          </Link>

          {/* Login Button */}
          <Link
            href="/login"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Login
          </Link>

          <ThemeToggle />
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-4 md:hidden">
          <ThemeToggle />
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-6 space-y-4">
          <Link href="/" className="block hover:text-primary">Home</Link>
          <Link href="/books" className="block hover:text-primary">Books</Link>
          <Link href="/about" className="block hover:text-primary">About</Link>
          <Link href="/contact" className="block hover:text-primary">Contact</Link>
          <Link
            href="/login"
            className="block mt-4 px-4 py-2 rounded-md bg-primary text-primary-foreground text-center"
          >
            Login
          </Link>
        </div>
      )}
    </header>
  )
}
