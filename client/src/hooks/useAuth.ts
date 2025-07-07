import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  login: string;
}

interface AuthStatus {
  authenticated: boolean;
  user?: AuthUser;
}

export default function useAuth() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/auth/status`, {
        credentials: 'include', // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        setAuthStatus(data);
        
        if (!data.authenticated) {
          router.push('/');
        }
      } else {
        setAuthStatus({ authenticated: false });
        router.push('/');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus({ authenticated: false });
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      router.push('/');
    }
  };

  return {
    authStatus,
    loading,
    logout,
    checkAuthStatus
  };
}
