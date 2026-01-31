'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { reviewApi } from '@/lib/api';
import { 
  Code2, 
  LogOut, 
  Plus, 
  Zap,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCode,
  Sparkles,
  TrendingUp,
  Activity,
  Upload,
  Github
} from 'lucide-react';
import Link from 'next/link';
import type { Review } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, checkAuth } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  const completedReviews = reviews.filter((r: any) => r.status === 'completed').length;
  const analyzingReviews = reviews.filter((r: any) => r.status === 'analyzing').length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Gradient orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative">
        {/* Header */}
        <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 animate-stagger-1 hover:scale-105 transition-transform">
                <Code2 className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-semibold">CodeReviewer</span>
              </Link>
              
              <div className="flex items-center gap-6">
                <div className={`text-sm text-gray-400 ${mounted ? 'animate-stagger-2' : 'opacity-0'}`}>
                  <span className="text-white font-semibold">{user.reviewsRemaining}</span> reviews left
                </div>
                
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition ${mounted ? 'animate-stagger-3' : 'opacity-0'}`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Welcome Section */}
          <div className={`mb-12 ${mounted ? 'animate-stagger-1' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs mb-4">
              <Sparkles className="w-3 h-3" />
              <span>Powered by Gemini 3</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              Welcome back, {user.email.split('@')[0]}! 
            </h1>
            <p className="text-gray-400 text-lg">
              Ready to ship better code? Let's analyze some repositories.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={<Code2 className="w-6 h-6 text-blue-400" />}
              title="Total Reviews"
              value={reviews.length.toString()}
              color="blue"
              delay="0.1s"
              mounted={mounted}
            />
            <StatCard
              icon={<CheckCircle2 className="w-6 h-6 text-green-400" />}
              title="Completed"
              value={completedReviews.toString()}
              color="green"
              delay="0.2s"
              mounted={mounted}
            />
            <StatCard
              icon={<Clock className="w-6 h-6 text-yellow-400" />}
              title="In Progress"
              value={analyzingReviews.toString()}
              color="yellow"
              delay="0.3s"
              mounted={mounted}
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
              title="Plan"
              value={user.plan.toUpperCase()}
              color="purple"
              delay="0.4s"
              mounted={mounted}
            />
          </div>

          {/* Main Action Cards */}
          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            {/* GitHub Integration */}
            <Link
              href="/dashboard/upload"
              className={`group relative overflow-hidden p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all duration-500 hover:scale-[1.02] ${mounted ? 'animate-stagger-3' : 'opacity-0'}`}
              style={{ animationDelay: '0.5s' }}
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Upload Files</h3>
                    <p className="text-sm text-gray-400">
                      Drag & drop your code files
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:gap-3 transition-all">
                  <span>Get started</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Animated particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
              <div className="absolute bottom-4 right-8 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '0.3s' }} />
            </Link>

            {/* Upload Files */}
            <Link
              href="/dashboard/upload"
              className={`group relative overflow-hidden p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-green-500/50 transition-all duration-500 hover:scale-[1.02] ${mounted ? 'animate-stagger-4' : 'opacity-0'}`}
              style={{ animationDelay: '0.6s' }}
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <FileCode className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Quick Analysis</h3>
                    <p className="text-sm text-gray-400">
                      Analyze files instantly
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-green-400 font-medium group-hover:gap-3 transition-all">
                  <span>Upload now</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Animated particles */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
              <div className="absolute bottom-4 right-8 w-1 h-1 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" style={{ animationDelay: '0.3s' }} />
            </Link>
          </div>

          {/* Recent Reviews Section */}
          <div className={mounted ? 'animate-stagger-5' : 'opacity-0'} style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-gray-400" />
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="relative overflow-hidden p-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-center">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
                
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/10">
                    <Code2 className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No reviews yet</h3>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Start your first code review to catch bugs before they reach production
                  </p>
                  <Link
                    href="/dashboard/upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create First Review</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {reviews.map((review: any, index: number) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    index={index}
                    mounted={mounted}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className={`mt-12 grid md:grid-cols-3 gap-6 ${mounted ? 'animate-stagger-6' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
            <TipCard
              icon={<Shield className="w-5 h-5 text-green-400" />}
              title="Security First"
              description="Critical vulnerabilities are flagged automatically"
              color="green"
            />
            <TipCard
              icon={<Zap className="w-5 h-5 text-yellow-400" />}
              title="Performance"
              description="Optimize your code with AI-powered suggestions"
              color="yellow"
            />
            <TipCard
              icon={<Sparkles className="w-5 h-5 text-purple-400" />}
              title="Ask Anything"
              description="Chat with AI for deeper code explanations"
              color="purple"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, delay, mounted }: any) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-500/60',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 hover:border-green-500/60',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 hover:border-yellow-500/60',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-500/60',
  };

  return (
    <div 
      className={`relative overflow-hidden p-6 rounded-xl border bg-gradient-to-br backdrop-blur-xl transition-all duration-300 hover:scale-105 group ${colors[color]} ${mounted ? 'animate-stagger-2' : 'opacity-0'}`}
      style={{ animationDelay: delay }}
    >
      {/* Animated shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shine" />
      </div>

      <div className="relative">
        <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
      </div>
    </div>
  );
}

function TipCard({ icon, title, description, color }: any) {
  const colors: Record<string, string> = {
    green: 'hover:border-green-500/30',
    yellow: 'hover:border-yellow-500/30',
    purple: 'hover:border-purple-500/30',
  };

  return (
    <div className={`p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl transition-all duration-300 hover:scale-105 ${colors[color]}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/5 rounded-lg">
          {icon}
        </div>
        <div>
          <h4 className="font-semibold text-white mb-1">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, index, mounted }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'analyzing':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30 animate-pulse';
      case 'failed':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'analyzing':
        return <Clock className="w-4 h-4 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Link
      href={`/dashboard/review/${review.id}`}
      className={`group relative overflow-hidden flex items-center justify-between p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] ${mounted ? 'animate-stagger-in' : 'opacity-0'}`}
      style={{ animationDelay: `${0.8 + index * 0.1}s` }}
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center gap-4 flex-1">
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
          <Code2 className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
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
      
      <div className="relative flex items-center gap-4">
        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(review.status)}`}>
          {getStatusIcon(review.status)}
          {review.status}
        </span>
        <div className="text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all">
          →
        </div>
      </div>
    </Link>
  );
}