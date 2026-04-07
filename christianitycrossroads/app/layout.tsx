import React from "react"
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { RootLayoutClient } from './layout-client';
import { ContextProvider } from "@/context/userContext"; 
import { Header } from '@/components/Header';
import { Toaster } from "react-hot-toast";
import { Footer } from '@/components/Footer';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });

// Remove the floating <meta> tag from here
// <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

// Use this instead for viewport settings (separate export)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Bookshelf - Your Personal Library',
  description: 'Store, organize, and access your favorite books in one beautiful place.',
  generator: 'Books Storage organizer App',
  // Remove viewport from here since we export it separately above
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground transition-colors duration-300">
        <ContextProvider>
          <Header />
          <RootLayoutClient>{children}</RootLayoutClient>
          <Toaster position="top-right" />
          <Footer />
        </ContextProvider>
      </body>
    </html>
  );
}