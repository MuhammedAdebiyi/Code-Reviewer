import axios from 'axios';
import type { 
  AuthResponse, 
  Review, 
  ReviewResults, 
  SubmitReviewRequest,
  SubmitReviewResponse 
} from './types';

// FIXED: Better environment variable handling
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use the environment variable or default
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  // Server-side
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

console.log('API URL:', API_URL); // Debug log

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      console.log('Registering with:', { email, password: '***' });
      const response = await api.post('/auth/register', { email, password });
      console.log('Register response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Register error - Full details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  githubCallback: async (code: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/github/callback', { code });
    return response.data;
  },
};

// Review API
export const reviewApi = {
  submit: async (data: SubmitReviewRequest): Promise<SubmitReviewResponse> => {
    const response = await api.post('/review/submit', data);
    return response.data;
  },

  getStatus: async (reviewId: string) => {
    const response = await api.get(`/review/${reviewId}/status`);
    return response.data;
  },

  getResults: async (reviewId: string): Promise<ReviewResults> => {
    const response = await api.get(`/review/${reviewId}/results`);
    return response.data;
  },

  getMyReviews: async (page = 1, pageSize = 20): Promise<Review[]> => {
    const response = await api.get(`/review?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  chat: async (reviewId: string, message: string) => {
    const response = await api.post(`/review/${reviewId}/chat`, { message });
    return response.data;
  },

  delete: async (reviewId: string) => {
    await api.delete(`/review/${reviewId}`);
  },
};

export default api;