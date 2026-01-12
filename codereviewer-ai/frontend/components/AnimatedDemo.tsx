// frontend/components/AnimatedDemo.tsx
'use client';

import { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, AlertCircle, Shield, Zap } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

export default function AnimatedDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const demoLogs: LogEntry[] = [
    {
      timestamp: '10:52:51.279',
      message: 'Starting code analysis...',
      type: 'info',
    },
    {
      timestamp: '10:52:51.312',
      message: 'Connecting to Gemini 3 API...',
      type: 'info',
    },
    {
      timestamp: '10:52:51.445',
      message: 'Detected application type: Python FastAPI',
      type: 'info',
    },
    {
      timestamp: '10:52:51.678',
      message: '#1 Analyzing code structure',
      type: 'info',
    },
    {
      timestamp: '10:52:52.123',
      message: '#2 Scanning for security vulnerabilities',
      type: 'info',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:52:52.456',
      message: '⚠️  Found SQL injection vulnerability in auth.py:45',
      type: 'warning',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:52:52.789',
      message: '#3 Checking performance patterns',
      type: 'info',
      icon: <Zap className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:52:53.012',
      message: '⚠️  N+1 query detected in user_service.py:23',
      type: 'warning',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:52:53.345',
      message: '#4 Analyzing code quality',
      type: 'info',
    },
    {
      timestamp: '10:52:53.678',
      message: '✓ Gemini 3 reasoning: Tracing dependencies...',
      type: 'success',
    },
    {
      timestamp: '10:52:54.012',
      message: '✓ Architecture analysis complete',
      type: 'success',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:52:54.234',
      message: 'Analysis complete! Found 12 issues:',
      type: 'success',
    },
    {
      timestamp: '10:52:54.456',
      message: '  • 2 critical security issues',
      type: 'error',
    },
    {
      timestamp: '10:52:54.567',
      message: '  • 3 performance bottlenecks',
      type: 'warning',
    },
    {
      timestamp: '10:52:54.678',
      message: '  • 7 code quality improvements',
      type: 'info',
    },
    {
      timestamp: '10:52:54.890',
      message: '✓ Report generated successfully',
      type: 'success',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (currentIndex < demoLogs.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, demoLogs[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, 400);

      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setLogs([]);
        setCurrentIndex(0);
      }, 3000);

      return () => clearTimeout(resetTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, mounted]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!mounted) {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 border-b-0 px-4 py-2.5 rounded-t-xl">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex items-center gap-2 ml-2 text-gray-500">
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">analysis.log</span>
          </div>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-b-xl p-4 font-mono text-xs h-[360px]"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Terminal Header - pxxl style */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 border-b-0 px-4 py-2.5 rounded-t-xl">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex items-center gap-2 ml-2 text-gray-500">
          <Terminal className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">analysis.log</span>
        </div>
      </div>

      {/* Terminal Content - pxxl style */}
      <div className="bg-black/50 border border-white/10 rounded-b-xl p-4 font-mono text-xs h-[360px] overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${getLogColor(log.type)} leading-relaxed animate-fadeIn`}
              style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'forwards' }}
            >
              {log.icon && <span className="mt-0.5 opacity-70">{log.icon}</span>}
              <span className="text-gray-600 select-none font-mono shrink-0">{log.timestamp}</span>
              <span className="flex-1 break-words">{log.message}</span>
            </div>
          ))}
          
          {/* Blinking Cursor */}
          {currentIndex < demoLogs.length && (
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-gray-600 font-mono">10:52:55.000</span>
              <div className="w-1.5 h-3.5 bg-blue-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle glow - pxxl style */}
      <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl -z-10 pointer-events-none"></div>
    </div>
  );
}