'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export default function BrowserMockup() {
  const [activeTab, setActiveTab] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Simulate analysis completion after 3 seconds
    const timer = setTimeout(() => {
      setShowResults(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const issues = [
    {
      type: 'Security',
      severity: 'critical',
      title: 'SQL Injection Vulnerability',
      file: 'auth.py',
      line: 45,
      icon: <Shield className="w-5 h-5" />,
      color: 'red',
    },
    {
      type: 'Performance',
      severity: 'high',
      title: 'N+1 Query Pattern Detected',
      file: 'user_service.py',
      line: 23,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'yellow',
    },
    {
      type: 'Quality',
      severity: 'medium',
      title: 'Complex Function (Cyclomatic Complexity: 15)',
      file: 'utils.py',
      line: 89,
      icon: <Info className="w-5 h-5" />,
      color: 'blue',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="relative">
      {/* Browser Chrome */}
      <div className="bg-gray-800 rounded-t-xl border border-gray-700 border-b-0">
        {/* Window Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* URL Bar */}
          <div className="flex-1 mx-4">
            <div className="bg-gray-900 rounded-lg px-4 py-1.5 text-sm text-gray-400 font-mono">
              codereviewer.ai/review/abc123
            </div>
          </div>
          
          <div className="w-20"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pt-2">
          {['Issues', 'Files', 'Chat'].map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                activeTab === i
                  ? 'bg-gray-900 text-white border-t border-x border-gray-700'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Browser Content */}
      <div className="bg-gray-900 rounded-b-xl border border-gray-700 border-t-0 p-6 min-h-[500px]">
        {!showResults ? (
          // Loading State
          <div className="flex flex-col items-center justify-center h-full py-20">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <p className="text-white text-lg font-semibold mb-2">Analyzing your code...</p>
            <p className="text-gray-400 text-sm">Gemini 3 is reviewing 12 files</p>
            
            {/* Progress Steps */}
            <div className="mt-8 space-y-2">
              {['Parsing structure', 'Security scan', 'Performance analysis', 'Generating report'].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-400">{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Results View
          <div className="animate-fadeIn">
            {/* Summary */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Analysis Complete</h3>
                <p className="text-gray-400">Found 12 issues across 8 files</p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">2</div>
                  <div className="text-xs text-gray-500">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">3</div>
                  <div className="text-xs text-gray-500">High</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">7</div>
                  <div className="text-xs text-gray-500">Medium</div>
                </div>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-3">
              {issues.map((issue, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)} backdrop-blur cursor-pointer hover:scale-[1.02] transition transform`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 text-${issue.color}-400`}>
                      {issue.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {issue.type}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {issue.file}:{issue.line}
                        </span>
                      </div>
                      <h4 className="font-semibold mb-2">{issue.title}</h4>
                      <p className="text-sm text-gray-400">
                        Click to view detailed explanation and fix suggestion from Gemini 3
                      </p>
                    </div>
                    <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm transition">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-2xl -z-10 animate-glow"></div>
    </div>
  );
}