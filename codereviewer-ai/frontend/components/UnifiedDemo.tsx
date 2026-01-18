// components/UnifiedDemo.tsx
'use client';

import { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, AlertCircle, Shield, Zap, Sparkles, Code2, AlertTriangle } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'code';
  icon?: React.ReactNode;
}

type Stage = 'analysis' | 'results' | 'solutions';

export default function UnifiedDemo() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentStage, setCurrentStage] = useState<Stage>('analysis');
  const [nextStage, setNextStage] = useState<Stage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  const stages = {
    analysis: {
      title: 'analysis.log',
      delay: 400,
      logs: [
        { timestamp: '10:52:51.279', message: 'Starting code analysis...', type: 'info' as const },
        { timestamp: '10:52:51.312', message: 'Connecting to Gemini 3 API...', type: 'info' as const },
        { timestamp: '10:52:51.445', message: 'Detected application type: Python FastAPI', type: 'info' as const },
        { timestamp: '10:52:51.678', message: '#1 Analyzing code structure', type: 'info' as const },
        { timestamp: '10:52:52.123', message: '#2 Scanning for security vulnerabilities', type: 'info' as const, icon: <Shield className="w-3.5 h-3.5" /> },
        { timestamp: '10:52:52.456', message: '⚠️  Found SQL injection vulnerability in auth.py:45', type: 'warning' as const, icon: <AlertCircle className="w-3.5 h-3.5" /> },
        { timestamp: '10:52:52.789', message: '#3 Checking performance patterns', type: 'info' as const, icon: <Zap className="w-3.5 h-3.5" /> },
        { timestamp: '10:52:53.012', message: '⚠️  N+1 query detected in user_service.py:23', type: 'warning' as const, icon: <AlertCircle className="w-3.5 h-3.5" /> },
        { timestamp: '10:52:53.345', message: '#4 Analyzing code quality', type: 'info' as const },
        { timestamp: '10:52:53.678', message: '✓ Gemini 3 reasoning: Tracing dependencies...', type: 'success' as const },
        { timestamp: '10:52:54.012', message: '✓ Architecture analysis complete', type: 'success' as const, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        { timestamp: '10:52:54.234', message: 'Analysis complete! Found 12 issues:', type: 'success' as const },
        { timestamp: '10:52:54.456', message: '  • 2 critical security issues', type: 'error' as const },
        { timestamp: '10:52:54.567', message: '  • 3 performance bottlenecks', type: 'warning' as const },
        { timestamp: '10:52:54.678', message: '  • 7 code quality improvements', type: 'info' as const },
        { timestamp: '10:52:54.890', message: '✓ Report generated successfully', type: 'success' as const, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
      ]
    },
    results: {
      title: 'results.log',
      delay: 350,
      logs: [
        { timestamp: '10:53:01.234', message: '✓ Analysis completed successfully', type: 'success' as const, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        { timestamp: '10:53:01.456', message: '', type: 'info' as const },
        { timestamp: '10:53:01.567', message: '📊 Summary Report:', type: 'info' as const },
        { timestamp: '10:53:01.678', message: '  Files analyzed: 12', type: 'info' as const },
        { timestamp: '10:53:01.789', message: '  Lines of code: 3,847', type: 'info' as const },
        { timestamp: '10:53:01.890', message: '  Analysis time: 4.2s', type: 'info' as const },
        { timestamp: '10:53:02.012', message: '', type: 'info' as const },
        { timestamp: '10:53:02.123', message: '🔍 Issues Found:', type: 'warning' as const },
        { timestamp: '10:53:02.234', message: '  🔴 2 Critical', type: 'error' as const, icon: <Shield className="w-3.5 h-3.5" /> },
        { timestamp: '10:53:02.345', message: '  🟡 3 High', type: 'warning' as const, icon: <AlertTriangle className="w-3.5 h-3.5" /> },
        { timestamp: '10:53:02.456', message: '  🟢 7 Medium/Low', type: 'info' as const },
        { timestamp: '10:53:02.567', message: '', type: 'info' as const },
        { timestamp: '10:53:02.678', message: '✓ Report generated: report_abc123.json', type: 'success' as const, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        { timestamp: '10:53:02.789', message: '✓ Ready to view fixes and suggestions', type: 'success' as const },
      ]
    },
    solutions: {
      title: 'ai-suggestions.log',
      delay: 300,
      logs: [
        { timestamp: '10:53:05.123', message: '🤖 Gemini 3 AI Assistant', type: 'success' as const, icon: <Sparkles className="w-3.5 h-3.5" /> },
        { timestamp: '10:53:05.234', message: '', type: 'info' as const },
        { timestamp: '10:53:05.345', message: '📝 Issue: SQL Injection in auth.py:45', type: 'warning' as const },
        { timestamp: '10:53:05.456', message: '', type: 'info' as const },
        { timestamp: '10:53:05.567', message: '❌ Vulnerable code:', type: 'error' as const },
        { timestamp: '10:53:05.678', message: 'query = f"SELECT * FROM users WHERE id={user_id}"', type: 'code' as const, icon: <Code2 className="w-3.5 h-3.5" /> },
        { timestamp: '10:53:05.789', message: '', type: 'info' as const },
        { timestamp: '10:53:05.890', message: '✅ Recommended fix:', type: 'success' as const },
        { timestamp: '10:53:06.012', message: 'query = "SELECT * FROM users WHERE id = ?"', type: 'code' as const, icon: <Code2 className="w-3.5 h-3.5" /> },
        { timestamp: '10:53:06.123', message: 'cursor.execute(query, (user_id,))', type: 'code' as const, icon: <Code2 className="w-3.5 h-3.5" /> },
        { timestamp: '10:53:06.234', message: '', type: 'info' as const },
        { timestamp: '10:53:06.345', message: '💡 Why this matters:', type: 'info' as const },
        { timestamp: '10:53:06.456', message: 'Parameterized queries prevent SQL injection', type: 'info' as const },
        { timestamp: '10:53:06.567', message: 'by separating SQL logic from user data.', type: 'info' as const },
        { timestamp: '10:53:06.678', message: '', type: 'info' as const },
        { timestamp: '10:53:06.789', message: '✓ Fix applied to 3 similar patterns', type: 'success' as const, icon: <Sparkles className="w-3.5 h-3.5" /> },
      ]
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const currentStageLogs = stages[currentStage].logs;
    const delay = stages[currentStage].delay;

    if (currentIndex < currentStageLogs.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, currentStageLogs[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      // Stage complete, transition to next
      const transitionTimer = setTimeout(() => {
        let next: Stage;
        if (currentStage === 'analysis') {
          next = 'results';
        } else if (currentStage === 'results') {
          next = 'solutions';
        } else {
          next = 'analysis';
        }
        
        setNextStage(next);
        setIsTransitioning(true);
        
        setTimeout(() => {
          setCurrentStage(next);
          setLogs([]);
          setCurrentIndex(0);
          setIsTransitioning(false);
          setNextStage(null);
        }, 700); // Slide transition duration
      }, 1500); // Pause before transition

      return () => clearTimeout(transitionTimer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, mounted, currentStage]);

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

  const getGlowColor = () => {
    switch (currentStage) {
      case 'analysis':
        return 'bg-blue-500/5';
      case 'results':
        return 'bg-green-500/5';
      case 'solutions':
        return 'bg-purple-500/5';
    }
  };

  const getCursorColor = () => {
    switch (currentStage) {
      case 'analysis':
        return 'bg-blue-500';
      case 'results':
        return 'bg-green-500';
      case 'solutions':
        return 'bg-purple-500';
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Terminal - with slide transition */}
      <div className="relative w-full overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 border-b-0 px-4 py-2.5 rounded-t-xl">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex items-center gap-2 ml-2 text-gray-500">
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">
              {stages[currentStage].title}
            </span>
          </div>
        </div>

        {/* Terminal Content Container - Sliding effect */}
        <div className="relative bg-black/50 border border-white/10 rounded-b-xl h-[360px] overflow-hidden">
          {/* Current Stage */}
          <div 
            className={`absolute inset-0 p-4 font-mono text-xs overflow-y-auto custom-scrollbar transition-transform duration-700 ease-in-out ${
              isTransitioning ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
            }`}
          >
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 leading-relaxed animate-deploy-step`}
                >
                  {log.icon && (
                    <span className={`mt-0.5 opacity-70 ${currentStage === 'solutions' ? 'text-blue-400' : ''}`}>
                      {log.icon}
                    </span>
                  )}
                  <span className="text-gray-600 select-none font-mono shrink-0">{log.timestamp}</span>
                  <span className={`flex-1 break-words ${getLogColor(log.type)}`}>{log.message}</span>
                </div>
              ))}
              
              {/* Blinking Cursor */}
              {currentIndex < stages[currentStage].logs.length && !isTransitioning && (
                <div className="flex items-center gap-2.5 mt-1 animate-deploy-step">
                  <span className="text-gray-600 font-mono">
                    {currentStage === 'analysis' ? '10:52:55.000' : 
                     currentStage === 'results' ? '10:53:03.000' : 
                     '10:53:07.000'}
                  </span>
                  <div className={`w-1.5 h-3.5 ${getCursorColor()} animate-pulse`}></div>
                </div>
              )}
            </div>
          </div>

          {/* Next Stage - sliding in */}
          {nextStage && (
            <div 
              className={`absolute inset-0 p-4 font-mono text-xs overflow-y-auto custom-scrollbar transition-transform duration-700 ease-in-out ${
                isTransitioning ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-start gap-2.5 text-gray-400 leading-relaxed">
                  <span className="text-gray-600 select-none font-mono shrink-0">
                    {nextStage === 'results' ? '10:53:01.000' : nextStage === 'solutions' ? '10:53:05.000' : '10:52:51.000'}
                  </span>
                  <span className="flex-1">Loading {stages[nextStage].title}...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subtle glow */}
        <div className={`absolute inset-0 ${getGlowColor()} rounded-xl blur-xl -z-10 pointer-events-none transition-colors duration-700`}></div>
      </div>

      {/* Bug Summary Cards - Below main terminal */}
      <div className="grid grid-cols-2 gap-4">
        {/* Security Issues Card */}
        <div className="relative group">
          <div className="bg-white/5 border border-red-500/20 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono text-red-400">Security</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">2</div>
            <div className="text-xs text-gray-400">Critical vulnerabilities</div>
          </div>
          <div className="absolute inset-0 bg-red-500/5 rounded-lg blur-lg -z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Performance Card */}
        <div className="relative group">
          <div className="bg-white/5 border border-yellow-500/20 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-mono text-yellow-400">Performance</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">3</div>
            <div className="text-xs text-gray-400">Bottlenecks found</div>
          </div>
          <div className="absolute inset-0 bg-yellow-500/5 rounded-lg blur-lg -z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
}