"use client";

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("http://localhost:3001/api/auth/login");
  };

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
