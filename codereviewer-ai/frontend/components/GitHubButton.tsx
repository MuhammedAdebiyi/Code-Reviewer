'use client';

import { Github } from 'lucide-react';

interface GitHubButtonProps {
  mode: 'login' | 'signup';
}

export default function GitHubButton({ mode }: GitHubButtonProps) {
  const handleGitHubAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/github/callback`;
    const scope = 'read:user user:email';
    
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    window.location.href = githubAuthUrl;
  };

  return (
    <button
      onClick={handleGitHubAuth}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg hover:bg-gray-800 hover:border-gray-600 transition"
    >
      <Github className="w-5 h-5" />
      <span>{mode === 'login' ? 'Continue with GitHub' : 'Sign up with GitHub'}</span>
    </button>
  );
}