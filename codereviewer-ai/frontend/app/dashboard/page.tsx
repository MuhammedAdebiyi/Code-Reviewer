'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { reviewApi } from '@/lib/api';
import { 
  Code2, 
  Github, 
  LogOut, 
  Plus, 
  History, 
  Zap,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCode,
  Star
} from 'lucide-react';
import Link from 'next/link';
import type { Review } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, checkAuth } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await reviewApi.getMyReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Code2 className="w-8 h-8" />
              <span className="text-2xl font-bold">CodeReviewer AI</span>
            </Link>

            <div className="flex items-center gap-6">
              <div className="text-sm text-gray-400">
                <span className="text-white font-semibold">{user.reviewsRemaining}</span> reviews remaining
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user.email.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Ready to analyze some code? Select a repository or upload files to get started.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<Code2 className="w-6 h-6 text-blue-400" />}
            title="Total Reviews"
            value={reviews.length.toString()}
            color="blue"
          />
          <StatCard
            icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
            title="Completed"
            value={reviews.filter((r: any) => r.status === 'completed').length.toString()}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-yellow-400" />}
            title="In Progress"
            value={reviews.filter((r: any) => r.status === 'analyzing').length.toString()}
            color="yellow"
          />
          <StatCard
            icon={<Zap className="w-6 h-6 text-purple-400" />}
            title="Plan"
            value={user.plan.toUpperCase()}
            color="purple"
          />
        </div>

        {/* Main Action Area */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* New Review Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-700 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Start New Review</h2>
              </div>

              <div className="grid gap-4">
                {/* GitHub Integration */}
                <Link
                  href="/dashboard/github"
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/50 rounded-xl hover:border-blue-400 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-900 rounded-lg">
                      <Github className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Analyze GitHub Repository
                      </h3>
                      <p className="text-sm text-gray-400">
                        Connect and analyze any public or private repo
                      </p>
                    </div>
                  </div>
                  <div className="text-blue-400 group-hover:translate-x-1 transition">→</div>
                </Link>

                {/* Upload Files */}
                <Link
                  href="/dashboard/upload"
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-green-600/20 to-teal-600/20 border border-green-500/50 rounded-xl hover:border-green-400 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-900 rounded-lg">
                      <FileCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Upload Code Files
                      </h3>
                      <p className="text-sm text-gray-400">
                        Drag & drop or select files from your computer
                      </p>
                    </div>
                  </div>
                  <div className="text-green-400 group-hover:translate-x-1 transition">→</div>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💡 Quick Tips</h3>
              <div className="space-y-4">
                <TipCard
                  icon={<Shield className="w-5 h-5 text-green-400" />}
                  text="Focus on security issues first - they're marked as critical"
                />
                <TipCard
                  icon={<Zap className="w-5 h-5 text-yellow-400" />}
                  text="Performance issues can save you hours of debugging later"
                />
                <TipCard
                  icon={<AlertCircle className="w-5 h-5 text-blue-400" />}
                  text="Ask follow-up questions in the chat for deeper explanations"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-6 h-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-white">Recent Reviews</h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4">Loading your reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-gray-800/30 backdrop-blur rounded-2xl border border-gray-700 p-12 text-center">
              <Code2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
              <p className="text-gray-400 mb-6">
                Start your first code review to see it here
              </p>
              <Link
                href="/dashboard/github"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Create First Review</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/50',
    green: 'from-green-500/20 to-green-600/20 border-green-500/50',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50',
  };

  return (
    <div className={`p-6 rounded-xl border bg-gradient-to-br backdrop-blur ${colors[color]}`}>
      <div className="mb-3">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}

function TipCard({ icon, text }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-lg">
      <div className="mt-0.5">{icon}</div>
      <p className="text-sm text-gray-300">{text}</p>
    </div>
  );
}

function ReviewCard({ review }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20';
      case 'analyzing':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'failed':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <Link
      href={`/dashboard/review/${review.id}`}
      className="flex items-center justify-between p-6 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 hover:border-blue-500 transition group"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-900 rounded-lg">
          <Code2 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {review.projectName}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{review.language}</span>
            <span>•</span>
            <span>{review.filesCount} files</span>
            <span>•</span>
            <span>{new Date(review.startedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(review.status)}`}>
          {review.status}
        </span>
        <div className="text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition">
          →
        </div>
      </div>
    </Link>
  );
}