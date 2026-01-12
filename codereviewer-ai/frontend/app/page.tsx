'use client';

import Link from 'next/link';
import { Code2, Zap, Shield, Brain, Github, ArrowRight, Sparkles } from 'lucide-react';
import AnimatedDemo from '@/components/AnimatedDemo';
import SuccessDemo from '@/components/SuccessDemo';
import SolutionDemo from '@/components/SolutionDemo';
import FeatureShowcase from '@/components/FeatureShowcase';
import AnimatedStats from '@/components/AnimatedStats';


export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative">
        {/* Header */}
        <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-semibold">CodeReviewer</span>
              </div>
              <div className="flex items-center gap-6">
                <Link href="#features" className="text-sm text-gray-400 hover:text-white transition">
                  Features
                </Link>
                <Link href="#demo" className="text-sm text-gray-400 hover:text-white transition">
                  Demo
                </Link>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Gemini 3</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              AI Code Review
              <br />
              That Actually Helps
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Catch bugs, security issues, and performance problems before they hit production.
              Powered by Google's most advanced AI.
            </p>
            
            <div className="flex items-center gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition inline-flex items-center gap-2"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#demo"
                className="px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition text-sm"
              >
                See demo
              </Link>
            </div>

            <p className="text-xs text-gray-600 mt-4">
              No credit card required · 10 free reviews
            </p>
          </div>
        </div>

        {/* Demo Section - Side by Side */}
        <div id="demo" className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: Description */}
            <div className="space-y-8 md:sticky md:top-32">
              <div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs mb-4">
                  Live Analysis
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Watch AI find bugs
                  <br />
                  in real-time
                </h2>
                <p className="text-gray-400 text-lg">
                  Gemini 3 analyzes your code structure, traces dependencies, and identifies issues with detailed explanations.
                </p>
              </div>

              <div className="space-y-4">
                <FeatureItem
                  icon={<Shield className="w-5 h-5" />}
                  title="Security Scanning"
                  description="Detect SQL injection, XSS, and other OWASP Top 10 vulnerabilities"
                />
                <FeatureItem
                  icon={<Zap className="w-5 h-5" />}
                  title="Performance Analysis"
                  description="Find N+1 queries, memory leaks, and bottlenecks"
                />
                <FeatureItem
                  icon={<Brain className="w-5 h-5" />}
                  title="Smart Reasoning"
                  description="Understand why issues matter with AI-powered explanations"
                />
              </div>
            </div>

            {/* Right: Animated Terminals */}
            <div className="space-y-6">
              <AnimatedDemo />
              <div className="grid grid-cols-2 gap-4">
                <SuccessDemo />
                <SolutionDemo />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Showcase - pxxl style cards */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for performance
            </h2>
            <p className="text-gray-400 text-lg">
              Enterprise-grade code analysis with zero configuration
            </p>
          </div>
          <FeatureShowcase />
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <AnimatedStats />
        </div>

        {/* Features Grid */}
        <div id="features" className="max-w-7xl mx-auto px-6 py-16 border-t border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need
            </h2>
            <p className="text-gray-400 text-lg">
              Professional code review in seconds, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-blue-500" />}
              title="Advanced Reasoning"
              description="Traces bugs through complex call stacks and understands causal relationships"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-green-500" />}
              title="Security First"
              description="Detects vulnerabilities with CVE references and severity scoring"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-yellow-500" />}
              title="Lightning Fast"
              description="Complete analysis in under 30 seconds per file"
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6 text-purple-500" />}
              title="Multi-Language"
              description="Python, JavaScript, TypeScript, C#, Go, and more"
            />
            <FeatureCard
              icon={<Github className="w-6 h-6 text-white" />}
              title="GitHub Integration"
              description="Analyze entire repositories with one click"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-pink-500" />}
              title="AI Explanations"
              description="Learn why issues matter with detailed reasoning"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 p-12 md:p-16 text-center">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to ship better code?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Join developers using AI to catch bugs before they reach production
              </p>
              <div className="flex items-center gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition inline-flex items-center gap-2"
                >
                  <Github className="w-5 h-5" />
                  Start for free
                </Link>
                <Link
                  href="#demo"
                  className="px-8 py-4 border border-white/10 rounded-lg hover:bg-white/5 transition"
                >
                  View demo
                </Link>
              </div>
              <p className="text-xs text-gray-600 mt-6">
                Free forever · No credit card required
              </p>
            </div>
            
            {/* Gradient orbs */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl opacity-20" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl opacity-20" />
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400">
                <Code2 className="w-5 h-5" />
                <span className="text-sm">© 2026 CodeReviewer</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="#" className="text-sm text-gray-400 hover:text-white transition">
                  Gemini 3 Hackathon
                </a>
                <a href="#" className="text-sm text-gray-400 hover:text-white transition">
                  Documentation
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:border-white/20">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function FeatureItem({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition">
      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
        {icon}
      </div>
      <div>
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}