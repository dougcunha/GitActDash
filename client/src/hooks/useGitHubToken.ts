import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function useGitHubToken() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const accessToken = searchParams.get('token');
    let currentToken = accessToken;

    if (typeof window !== 'undefined') {
      currentToken = accessToken || localStorage.getItem('github_token');

      if (accessToken) {
        localStorage.setItem('github_token', accessToken);
        window.history.replaceState({}, document.title, '/dashboard');
      }
    }

    if (!currentToken) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return;
    }

    setToken(currentToken);
  }, [searchParams, mounted]);

  return token;
}
