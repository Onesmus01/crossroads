/**
 * Nuclear logout — clears backend session, ALL storage, cookies,
 * and forces a hard reload so zero React state survives.
 */
export async function logout(redirectTo = '/login') {
  if (typeof window === 'undefined') return;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';
  const token = localStorage.getItem('token') || '';

  // 1. Tell backend to clear httpOnly cookies (best-effort)
  try {
    await fetch(`${backendUrl}/user/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Backend down — still nuke client side
  }

  // 2. Wipe ALL client storage
  localStorage.clear();
  sessionStorage.clear();

  // 3. Wipe ALL client-accessible cookies
  const hostname = window.location.hostname;
  document.cookie.split(';').forEach((cookie) => {
    const [name] = cookie.split('=');
    const trimmed = name.trim();
    document.cookie = `${trimmed}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${trimmed}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
    document.cookie = `${trimmed}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${hostname};`;
  });

  // 4. Broadcast to other tabs
  window.dispatchEvent(
    new StorageEvent('storage', { key: 'logout', newValue: Date.now().toString() })
  );

  // 5. Hard redirect — kills every React context & memory cache
  window.location.replace(redirectTo);
}