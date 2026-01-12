'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      if (token) {
        localStorage.setItem('token', token);

        try {
          await checkAuth();
          toast.success('Welcome to CodeReviewer AI!');
          router.replace('/dashboard');
        } catch {
          toast.error('Authentication failed');
          router.replace('/auth/login');
        }
      } else {
        toast.error('No token received');
        router.replace('/auth/login');
      }
    };

    handleCallback();
  }, [searchParams, checkAuth, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-white text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}
