'use client';

import { ReactNode, useEffect, useState } from 'react';

export function RootLayoutClient({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', saved === 'dark');
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}
