import { Suspense } from 'react';
import AuthCallbackClient from './auth-callback-client';

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-white text-lg">Completing authentication...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
