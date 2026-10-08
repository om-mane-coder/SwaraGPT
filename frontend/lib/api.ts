import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const storage = localStorage.getItem('swara-storage');
    if (storage) {
      try {
        const { state } = JSON.parse(storage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error('Error parsing token from storage', e);
      }
    }
  }
  return config;
});

export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; role?: string; experience_level?: string; tradition?: string; preferred_tonic?: string; target_raga?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

export const chatApi = {
  send: (message: string, performance_context?: any) =>
    api.post('/chat', { message, performance_context }),
  sendMessage: (message: string, conversation_id?: string, performance_context?: any) =>
    api.post('/chat', { message, conversation_id, performance_context }),
  getConversations: () => api.get('/chat/conversations'),
  getHistory: (conversation_id: string) => api.get(`/chat/history/${conversation_id}`),
};

export const audioApi = {
  uploadAudio: (formData: FormData) =>
    api.post('/audio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  saveRecording: (formData: FormData) =>
    api.post('/audio/recording', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyze: (formData: FormData) =>
    api.post('/audio/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  generateSwaraAudio: (data: any) =>
    api.post('/audio/generate', data),
};

export const analysisApi = {
  runFullAnalysis: (formData: FormData) =>
    api.post('/analysis/full', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyzeDirect: (formData: FormData) =>
    api.post('/analysis/full', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  identifySong: (data: any) =>
    api.post('/analysis/song', data),
  getSessionReport: (sessionId: string) =>
    api.get(`/analysis/session/${sessionId}`),
  analyzePakad: (data: { target_raga: string; file_path?: string }) =>
    api.post('/analysis/pakad', data),
  get22Shrutis: () =>
    api.get('/analysis/shrutis'),
};

export const ragasApi = {
  getAll: (params?: { q?: string; tradition?: string; thaat?: string }) =>
    api.get('/ragas', { params }),
  listRagas: (params?: { q?: string; tradition?: string; thaat?: string }) =>
    api.get('/ragas', { params }),
  getRagaById: (id: string | number) =>
    api.get(`/ragas/${id}`),
};

export const progressApi = {
  getSummary: () => api.get('/progress/summary'),
  getHistory: () => api.get('/progress/history'),
  compareSessions: (session_id_1: string, session_id_2: string) =>
    api.get('/progress/compare', { params: { session_id_1, session_id_2 } }),
};

export const practiceApi = {
  getRecommendations: () => api.get('/practice/recommendations'),
  getExercises: () => api.get('/practice/exercises'),
};

export const usersApi = {
  updateProfile: (data: any) => api.put('/users/profile', data),
  getSettings: () => api.get('/users/settings'),
  deleteRecording: (sessionId: string) => api.delete(`/users/recording/${sessionId}`),
  deleteAccount: () => api.delete('/users/account'),
};

export default api;
