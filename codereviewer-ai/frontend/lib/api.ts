import axios from 'axios';
import type { 
  AuthResponse, 
  Review, 
  ReviewResults, 
  SubmitReviewRequest,
  SubmitReviewResponse 
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
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