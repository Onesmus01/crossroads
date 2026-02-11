import React from "react"
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { RootLayoutClient } from './layout-client';

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
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
