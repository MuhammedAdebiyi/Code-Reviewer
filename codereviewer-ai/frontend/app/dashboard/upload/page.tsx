'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  ArrowLeft, 
  FileCode, 
  X, 
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { reviewApi } from '@/lib/api';
import { useDropzone } from 'react-dropzone';

export default function UploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python': ['.py'],
      'text/x-csharp': ['.cs'], 
      'text/javascript': ['.js'],
      'text/typescript': ['.ts', '.tsx'],
      'text/x-java': ['.java'],
      'text/x-go': ['.go'],
      'text/x-rust': ['.rs'],
      'text/x-c': ['.c', '.h'],
      'text/x-c++': ['.cpp', '.hpp'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const detectLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'py': 'Python',
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'tsx': 'TypeScript',
      'cs': 'C#',
      'java': 'Java',
      'go': 'Go',
      'rs': 'Rust',
      'c': 'C',
      'cpp': 'C++',
      'hpp': 'C++',
      'h': 'C',
    };
    return langMap[ext || ''] || 'Unknown';
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Read file contents
      const filePromises = files.map(file => {
        return new Promise<{ path: string; content: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              path: file.name,
              content: reader.result as string,
            });
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      });

      const fileContents = await Promise.all(filePromises);
      
      // Simulate progress
      setUploadProgress(30);

      // Detect primary language
      const languages = files.map(f => detectLanguage(f.name));
      const primaryLanguage = languages.sort((a, b) =>
        languages.filter(v => v === a).length - languages.filter(v => v === b).length
      ).pop() || 'Mixed';

      setUploadProgress(50);

      // Submit for review
      const response = await reviewApi.submit({
        projectName: `Upload-${Date.now()}`,
        language: primaryLanguage,
        files: fileContents,
      });

      setUploadProgress(100);

      toast.success('Analysis started!');
      router.push(`/dashboard/review/${response.reviewId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start analysis');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const colors: Record<string, string> = {
      'py': 'text-blue-400',
      'js': 'text-yellow-400',
      'ts': 'text-blue-500',
      'tsx': 'text-blue-500',
      'cs': 'text-purple-400',
      'java': 'text-red-400',
      'go': 'text-cyan-400',
      'rs': 'text-orange-400',
    };
    return colors[ext || ''] || 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Gradient orbs */}
      <div className="fixed top-20 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="fixed bottom-20 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative">
        {/* Header */}
        <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-blue-400 transition animate-stagger-1">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="mb-8 animate-stagger-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs mb-4">
              <Sparkles className="w-3 h-3" />
              <span>AI-Powered Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              Upload Code Files
            </h1>
            <p className="text-gray-400 text-lg">
              Drop your files and let Gemini 3 find bugs, security issues, and optimization opportunities
            </p>
          </div>

          {/* Upload Area */}
          <div className="mb-8 animate-stagger-2" style={{ animationDelay: '0.1s' }}>
            <div
              {...getRootProps()}
              className={`relative overflow-hidden p-12 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${
                isDragActive
                  ? 'border-blue-500 bg-blue-500/10 scale-105'
                  : 'border-white/20 bg-white/5 hover:border-blue-500/50 hover:bg-white/10'
              }`}
            >
              <input {...getInputProps()} />
              
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10 transition-opacity duration-300 ${isDragActive ? 'opacity-100' : 'opacity-0'}`} />

              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl border border-white/10">
                  <Upload className={`w-10 h-10 transition-all duration-300 ${isDragActive ? 'text-blue-400 scale-110' : 'text-green-400'}`} />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isDragActive ? 'Drop files here' : 'Drag & drop your code files'}
                </h3>
                <p className="text-gray-400 mb-4">
                  or click to browse from your computer
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-white/5 rounded">Python</span>
                  <span className="px-2 py-1 bg-white/5 rounded">JavaScript</span>
                  <span className="px-2 py-1 bg-white/5 rounded">TypeScript</span>
                  <span className="px-2 py-1 bg-white/5 rounded">C#</span>
                  <span className="px-2 py-1 bg-white/5 rounded">Java</span>
                  <span className="px-2 py-1 bg-white/5 rounded">Go</span>
                  <span className="px-2 py-1 bg-white/5 rounded">Rust</span>
                </div>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mb-8 animate-stagger-3" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Selected Files ({files.length})
                </h3>
                <button
                  onClick={() => setFiles([])}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-all animate-slide-in"
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <FileCode className={`w-5 h-5 ${getFileIcon(file.name)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{detectLanguage(file.name)}</span>
                          <span>•</span>
                          <span>{(file.size / 1024).toFixed(2)} KB</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4 animate-stagger-4" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={handleSubmit}
              disabled={files.length === 0 || uploading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing... {uploadProgress}%</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Start Analysis</span>
                </>
              )}
            </button>

            <Link
              href="/dashboard"
              className="px-6 py-4 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/5 transition"
            >
              Cancel
            </Link>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 animate-slide-in">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-6 animate-stagger-5" style={{ animationDelay: '0.4s' }}>
            <InfoCard
              icon={<CheckCircle2 className="w-5 h-5 text-green-400" />}
              title="What we check"
              items={[
                'Security vulnerabilities',
                'Performance issues',
                'Code quality',
                'Best practices',
              ]}
            />
            <InfoCard
              icon={<Zap className="w-5 h-5 text-blue-400" />}
              title="Analysis features"
              items={[
                'Multi-file context',
                'Detailed explanations',
                'Fix suggestions',
                'Interactive chat',
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, items }: any) {
  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <ul className="space-y-2">
        {items.map((item: string, index: number) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}