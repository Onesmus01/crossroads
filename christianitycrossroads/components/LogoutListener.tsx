'use client';

import { useEffect } from 'react';

export function LogoutListener({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'logout') {
        // Another tab logged out — hard reload this tab too
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return <>{children}</>;
}