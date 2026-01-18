'use client';

import { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

interface SuccessDemoProps {
  isActive?: boolean;
}

export default function SuccessDemo({ isActive = true }: SuccessDemoProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const demoLogs: LogEntry[] = [
    {
      timestamp: '10:53:01.234',
      message: '✓ Analysis completed successfully',
      type: 'success',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:53:01.456',
      message: '',
      type: 'info',
    },
    {
      timestamp: '10:53:01.567',
      message: '📊 Summary Report:',
      type: 'info',
    },
    {
      timestamp: '10:53:01.678',
      message: '  Files analyzed: 12',
      type: 'info',
    },
    {
      timestamp: '10:53:01.789',
      message: '  Lines of code: 3,847',
      type: 'info',
    },
    {
      timestamp: '10:53:01.890',
      message: '  Analysis time: 4.2s',
      type: 'info',
    },
    {
      timestamp: '10:53:02.012',
      message: '',
      type: 'info',
    },
    {
      timestamp: '10:53:02.123',
      message: '🔍 Issues Found:',
      type: 'warning',
    },
    {
      timestamp: '10:53:02.234',
      message: '  🔴 2 Critical',
      type: 'error',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:53:02.345',
      message: '  🟡 3 High',
      type: 'warning',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:53:02.456',
      message: '  🟢 7 Medium/Low',
      type: 'info',
    },
    {
      timestamp: '10:53:02.567',
      message: '',
      type: 'info',
    },
    {
      timestamp: '10:53:02.678',
      message: '✓ Report generated: report_abc123.json',
      type: 'success',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
      timestamp: '10:53:02.789',
      message: '✓ Ready to view fixes and suggestions',
      type: 'success',
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
      }, 350);

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
            <span className="text-xs font-mono">results.log</span>
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
          <span className="text-xs font-mono">results.log</span>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="bg-black/50 border border-white/10 rounded-b-xl p-4 font-mono text-xs h-[360px] overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${getLogColor(log.type)} leading-relaxed animate-deploy-step`}
            >
              {log.icon && <span className="mt-0.5 opacity-70">{log.icon}</span>}
              <span className="text-gray-600 select-none font-mono shrink-0">{log.timestamp}</span>
              <span className="flex-1 break-words">{log.message}</span>
            </div>
          ))}
          
          {/* Blinking Cursor */}
          {isActive && currentIndex < demoLogs.length && (
            <div className="flex items-center gap-2.5 mt-1 animate-deploy-step">
              <span className="text-gray-600 font-mono">10:53:03.000</span>
              <div className="w-1.5 h-3.5 bg-green-500 animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle glow */}
      <div className="absolute inset-0 bg-green-500/5 rounded-xl blur-xl -z-10 pointer-events-none"></div>
    </div>
  );
}