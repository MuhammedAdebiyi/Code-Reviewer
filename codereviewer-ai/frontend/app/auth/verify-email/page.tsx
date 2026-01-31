'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Code2, Mail, CheckCircle2, XCircle, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      await authApi.verifyEmail(code);
      setVerificationStatus('success');
      toast.success('Email verified successfully!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error: any) {
      setVerificationStatus('error');
      setErrorMessage(error.message || 'Verification failed');
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email address not found');
      return;
    }

    try {
      await authApi.resendVerificationCode(email);
      toast.success('Verification code resent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-12">
      {/* Animated grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Gradient orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative w-full max-w-md">
        {/* Logo - Animated */}
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 mb-8 animate-stagger-1 hover:scale-105 transition-transform"
        >
          <Code2 className="w-6 h-6 text-green-500" />
          <span className="text-xl font-semibold text-white">CodeReviewer</span>
        </Link>

        {/* Verification Card - Animated */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-stagger-2">
          {verificationStatus === 'idle' && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl mb-4">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-4">
                  <Sparkles className="w-3 h-3" />
                  <span>Verify your email</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Check your inbox</h2>
                <p className="text-gray-400 text-sm">
                  We've sent a 6-digit verification code to{' '}
                  <span className="text-white font-medium">{email || 'your email'}</span>
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code Input */}
                <div className="animate-stagger-3">
                  <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                    Verification code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500 text-center">Enter the 6-digit code from your email</p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 animate-slideIn">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isVerifying || code.length !== 6}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] animate-stagger-4"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify email</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Resend Code */}
              <div className="mt-6 text-center animate-stagger-5">
                <p className="text-sm text-gray-400">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-green-400 hover:text-green-300 font-medium transition-colors hover:underline"
                  >
                    Resend code
                  </button>
                </p>
              </div>
            </>
          )}

          {/* Success State */}
          {verificationStatus === 'success' && (
            <div className="text-center py-8 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full mb-6 animate-checkmark">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email verified!</h2>
              <p className="text-gray-400 mb-6">
                Your account is now active. Redirecting to dashboard...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {verificationStatus === 'error' && (
            <div className="text-center py-8 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification failed</h2>
              <p className="text-gray-400 mb-6">{errorMessage}</p>
              <button
                onClick={() => {
                  setVerificationStatus('idle');
                  setCode('');
                  setErrorMessage('');
                }}
                className="px-6 py-2 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center animate-stagger-6">
          <Link
            href="/auth/login"
            className="text-sm text-gray-400 hover:text-white transition-colors hover:underline"
          >
            Back to login
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4 animate-stagger-7">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 transition">Help</a>
            <span>•</span>
            <a href="#" className="hover:text-gray-300 transition">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}