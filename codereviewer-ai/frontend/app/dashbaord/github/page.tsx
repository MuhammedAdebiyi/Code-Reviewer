'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Search, Star, GitFork, Code2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { reviewApi } from '@/lib/api';

// Mock GitHub repos (in production, fetch from GitHub API)
const mockRepos = [
  {
    id: 1,
    name: 'my-awesome-app',
    description: 'A full-stack application built with React and Node.js',
    language: 'JavaScript',
    stars: 42,
    forks: 8,
    updated: '2 hours ago',
    private: false,
  },
  {
    id: 2,
    name: 'python-ml-project',
    description: 'Machine learning project for image classification',
    language: 'Python',
    stars: 15,
    forks: 3,
    updated: '1 day ago',
    private: false,
  },
  {
    id: 3,
    name: 'backend-api',
    description: 'RESTful API built with ASP.NET Core',
    language: 'C#',
    stars: 8,
    forks: 2,
    updated: '3 days ago',
    private: true,
  },
  {
    id: 4,
    name: 'react-dashboard',
    description: 'Admin dashboard with analytics and charts',
    language: 'TypeScript',
    stars: 23,
    forks: 5,
    updated: '5 days ago',
    private: false,
  },
  {
    id: 5,
    name: 'mobile-app',
    description: 'Cross-platform mobile app with React Native',
    language: 'TypeScript',
    stars: 31,
    forks: 12,
    updated: '1 week ago',
    private: false,
  },
];

export default function GitHubReposPage() {
  const router = useRouter();
  const [repos, setRepos] = useState(mockRepos);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAnalyze = async (repo: any) => {
    setSelectedRepo(repo.id);
    setAnalyzing(true);

    try {
      // In production, this would fetch files from GitHub and submit for analysis
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      const response = await reviewApi.submit({
        projectName: repo.name,
        language: repo.language,
        files: [
          {
            path: 'src/main.py',
            content: '# Sample code for demo\nprint("Hello World")',
          },
        ],
      });

      toast.success('Analysis started!');
      router.push(`/dashboard/review/${response.reviewId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start analysis');
      setAnalyzing(false);
      setSelectedRepo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Github className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold text-white">Select Repository</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Choose a repository to analyze with Gemini 3
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Repository List */}
        <div className="grid gap-4">
          {filteredRepos.length === 0 ? (
            <div className="text-center py-12">
              <Code2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No repositories found</p>
            </div>
          ) : (
            filteredRepos.map((repo) => (
              <div
                key={repo.id}
                className="p-6 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 hover:border-blue-500 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Repo Name */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{repo.name}</h3>
                      {repo.private && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded border border-yellow-500/50">
                          Private
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 mb-4">{repo.description}</p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>{repo.language}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4" />
                        <span>{repo.stars}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GitFork className="w-4 h-4" />
                        <span>{repo.forks}</span>
                      </div>
                      <span>Updated {repo.updated}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleAnalyze(repo)}
                    disabled={analyzing && selectedRepo === repo.id}
                    className="ml-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {analyzing && selectedRepo === repo.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Code2 className="w-5 h-5" />
                        <span>Analyze</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Code2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">How it works</h4>
              <ol className="text-sm text-gray-300 space-y-2">
                <li>1. Select a repository to analyze</li>
                <li>2. Gemini 3 will clone and analyze all code files</li>
                <li>3. Get detailed security, performance, and quality insights</li>
                <li>4. Ask follow-up questions in the chat</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}