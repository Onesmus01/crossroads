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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export const metadata: Metadata = {
  title: 'Christianity Crossroads',
  description: 'Access your favorite books in one beautiful place.',
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