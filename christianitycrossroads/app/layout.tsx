import React from "react"
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { RootLayoutClient } from './layout-client';
import { ContextProvider } from "@/context/userContext"; 
import { Toaster } from "react-hot-toast";



import './globals.css';

const _geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bookshelf - Your Personal Library',
  description: 'Store, organize, and access your favorite books in one beautiful place.',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
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

        <RootLayoutClient>{children}</RootLayoutClient>
        <Toaster position="top-right" />
    </ContextProvider>
      </body>
    </html>
  );
}
