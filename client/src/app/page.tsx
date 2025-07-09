"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { config } from '@/config/env';

export default function Home() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${config.serverUrl}/api/auth/status`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            router.push('/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleLogin = () => {
    window.location.href = `${config.serverUrl}/api/auth/login`;
  };

  if (isChecking) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">GitHub Actions Dashboard</h1>
        <button
          onClick={handleLogin}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
        >
          Login with GitHub
        </button>
      </div>
    </main>
  );
}
