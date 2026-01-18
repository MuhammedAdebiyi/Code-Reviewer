'use client';

import { useState, useEffect } from 'react';
import { Terminal, Sparkles, Code2 } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'code';
  icon?: React.ReactNode;
}

interface SolutionDemoProps {
  isActive?: boolean;
}

export default function SolutionDemo({ isActive = true }: SolutionDemoProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const demoLogs: LogEntry[] = [
    {
      timestamp: '10:53:05.123',
      message: '🤖 Gemini 3 AI Assistant',
      type: 'success',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:53:05.234',
      message: '',
      type: 'info',
    },
    {
      timestamp: '10:53:05.345',
      message: '📝 Issue: SQL Injection in auth.py:45',
      type: 'warning',
    },
    {
      timestamp: '10:53:05.456',
      message: '',
      type: 'info',
    },
    {
      timestamp: '10:53:05.567',
      message: '❌ Vulnerable code:',
      type: 'error',
    },
    {
      timestamp: '10:53:05.678',
      message: 'query = f"SELECT * FROM users WHERE id={user_id}"',
      type: 'code',
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:53:05.789',
      message: '',
      type: 'info',
    },
    {
      timestamp: '10:53:05.890',
      message: '✅ Recommended fix:',
      type: 'success',
    },
    {
      timestamp: '10:53:06.012',
      message: 'query = "SELECT * FROM users WHERE id = ?"',
      type: 'code',
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:53:06.123',
      message: 'cursor.execute(query, (user_id,))',
      type: 'code',
      icon: <Code2 className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:53:06.234',
      message: '',
      type: 'info',
    },
    {
      timestamp: '10:53:06.345',
      message: '💡 Why this matters:',
      type: 'info',
    },
    {
      timestamp: '10:53:06.456',
      message: 'Parameterized queries prevent SQL injection',
      type: 'info',
    },
    {
      timestamp: '10:53:06.567',
      message: 'by separating SQL logic from user data.',
      type: 'info',
    },
    {
      timestamp: '10:53:06.678',
      message: '',
      type: 'info',
    },
    {
      timestamp: '10:53:06.789',
      message: '✓ Fix applied to 3 similar patterns',
      type: 'success',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isActive) return;

    if (currentIndex < demoLogs.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, demoLogs[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, 300);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, mounted, isActive]);

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'code':
        return 'text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded';
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
            <span className="text-xs font-mono">ai-suggestions.log</span>
          </div>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-b-xl p-4 font-mono text-xs h-[360px]"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 border-b-0 px-4 py-2.5 rounded-t-xl">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
        <div className="flex items-center gap-2 ml-2 text-gray-500">
          <Terminal className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">ai-suggestions.log</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="bg-black/50 border border-white/10 rounded-b-xl p-4 font-mono text-xs h-[360px] overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 leading-relaxed animate-deploy-step`}
            >
              {log.icon && <span className="mt-0.5 opacity-70 text-blue-400">{log.icon}</span>}
              <span className="text-gray-600 select-none font-mono shrink-0">{log.timestamp}</span>
              <span className={`flex-1 break-words ${getLogColor(log.type)}`}>{log.message}</span>
            </div>
          ))}
          
          {/* Blinking Cursor */}
          {isActive && currentIndex < demoLogs.length && (
            <div className="flex items-center gap-2.5 mt-1 animate-deploy-step">
              <span className="text-gray-600 font-mono">10:53:07.000</span>
              <div className="w-1.5 h-3.5 bg-purple-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle glow */}
      <div className="absolute inset-0 bg-purple-500/5 rounded-xl blur-xl -z-10 pointer-events-none"></div>
    </div>
  );
}