// frontend/components/FeatureShowcase.tsx
'use client';

import { Shield, Database, Zap } from 'lucide-react';

export default function FeatureShowcase() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Smart Analysis */}
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-300"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-xs font-mono text-gray-500">01</div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">Smart Security Scan</h3>
          <p className="text-sm text-gray-400 mb-6">
            Automatic Layer 7 analysis that detects SQL injection, XSS, and OWASP Top 10 vulnerabilities without any configuration.
          </p>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Threat Detection</span>
              <span className="text-green-400 font-medium">98.7%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">False Positives</span>
              <span className="text-blue-400 font-medium">{"< 0.1%"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Analysis Time</span>
              <span className="text-purple-400 font-medium">{"< 30s"}</span>
            </div>
          </div>

          {/* Visual indicator */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 w-[98.7%]"></div>
              </div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Code Storage */}
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-300"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Database className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-xs font-mono text-gray-500">02</div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">Analysis History</h3>
          <p className="text-sm text-gray-400 mb-6">
            High-performance storage with automated daily backups and cross-session persistence to track your code improvements over time.
          </p>

          {/* File list */}
          <div className="space-y-2">
            {[
              { name: 'auth.py', size: '2.5KB', status: 'reviewed' },
              { name: 'models.py', size: '8.1KB', status: 'reviewing' },
              { name: 'utils.py', size: '1.2KB', status: 'queued' },
            ].map((file, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    file.status === 'reviewed' ? 'bg-green-500' :
                    file.status === 'reviewing' ? 'bg-yellow-500 animate-pulse' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-xs font-mono text-white">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500">{file.size}</span>
              </div>
            ))}
          </div>

          {/* Backup status */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Last backup</span>
              <span className="text-green-400">Just now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instant Results */}
      <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all duration-300"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-xs font-mono text-gray-500">03</div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">Instant Deployments</h3>
          <p className="text-sm text-gray-400 mb-6">
            Connect your GitHub and watch as Gemini 3 provisions high-performance analysis to review your code globally in seconds.
          </p>

          {/* Deployment steps */}
          <div className="space-y-3">
            {[
              { step: 'Parsing AST', status: 'complete', time: '0.2s' },
              { step: 'Security scan', status: 'complete', time: '1.8s' },
              { step: 'Quality check', status: 'active', time: '...' },
              { step: 'Generate report', status: 'pending', time: '-' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.status === 'complete' && (
                    <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    </div>
                  )}
                  {item.status === 'active' && (
                    <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    </div>
                  )}
                  {item.status === 'pending' && (
                    <div className="w-4 h-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                    </div>
                  )}
                  <span className="text-xs text-gray-400">{item.step}</span>
                </div>
                <span className="text-xs font-mono text-gray-600">{item.time}</span>
              </div>
            ))}
          </div>

          {/* Performance metric */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Avg. Latency</span>
              <span className="text-xs font-mono text-green-400">{"< 2ms"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}