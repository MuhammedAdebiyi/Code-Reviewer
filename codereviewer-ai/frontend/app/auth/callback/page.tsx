'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Code2, Loader2 } from 'lucide-react';

export default function GitHubCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast.error('GitHub authentication failed');
        router.push('/auth/login');
        return;
      }

      if (!code) {
        toast.error('No authorization code received');
        router.push('/auth/login');
        return;
      }

      try {
        // Exchange code for token
        const response = await authApi.githubCallback(code);

        if (response.success && response.token && response.user) {
          // Save token
          localStorage.setItem('token', response.token);
          
          // Update store
          useAuthStore.setState({
            user: response.user,
            token: response.token
          });

          toast.success('Successfully signed in with GitHub!');
          router.push('/dashboard');
        } else {
          throw new Error(response.message || 'Authentication failed');
        }
      } catch (error: any) {
        console.error('GitHub callback error:', error);
        toast.error(error.message || 'Authentication failed');
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      {/* Grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Code2 className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-semibold text-white">CodeReviewer</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Authenticating with GitHub...
          </h2>
          <p className="text-gray-400 text-sm">
            Please wait while we complete your sign in
          </p>
        </div>
      </div>
    </div>
  );
}