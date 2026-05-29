// layout-client.tsx — FIXED
'use client';

import { ReactNode, useEffect } from 'react';

export function RootLayoutClient({ children }: { children: ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  // NEVER return null — always render children for SSR
  return <>{children}</>;
}