// Authentication Types
export interface User {
  id: string;
  email: string;
  plan: string;
  reviewsRemaining: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Code Review Types
export interface CodeFile {
  path: string;
  content: string;
  language?: string;
}

export interface Issue {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line: number;
  title: string;
  description: string;
  suggestion: string;
  reasoning: string;
  codeSnippet: string;
}

export interface ReviewSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byType: Record<string, number>;
}

export interface Review {
  id: string;
  projectName: string;
  language: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  filesCount: number;
  totalLines: number;
  startedAt: string;
  completedAt?: string;
}

export interface ReviewResults {
  reviewId: string;
  status: string;
  summary: ReviewSummary;
  issues: Issue[];
  architectureAnalysis: string;
  filesAnalyzed: number;
  totalLines: number;
}

// API Request Types
export interface SubmitReviewRequest {
  projectName: string;
  language: string;
  files: CodeFile[];
}

export interface SubmitReviewResponse {
  reviewId: string;
  status: string;
  estimatedTime: string;
  filesCount: number;
}