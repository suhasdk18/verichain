import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  registerInitiate: (data) => api.post('/auth/register/initiate', data),
  registerFinalize: (data) => api.post('/auth/register/finalize', data),
  loginInitiate: (data) => api.post('/auth/login/initiate', data),
  loginFinalize: (data) => api.post('/auth/login/finalize', data),
};

export const applicationsAPI = {
  apply: (data) => api.post('/applications/apply', data),
  getMyApplications: () => api.get('/applications/my-list'),
};

export const adminAPI = {
  getPending: () => api.get('/admin/pending'),
  approve: (appId) => api.post(`/admin/approve/${appId}`),
  reject: (appId) => api.post(`/admin/reject/${appId}`),
};

export const downloadAPI = {
  downloadZip: (appId) => api.get(`/download/zip/${appId}`, { responseType: 'blob' }),
};

export const chatbotAPI = {
  submitFeedback: (data) => api.post('/chatbot/submit-feedback', data),
  initiateSecureView: (data) => api.post('/chatbot/initiate-secure-view', data),
};

export const analyticsAPI = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getAdminAnalytics: () => api.get('/analytics/admin'),
};

export default api;