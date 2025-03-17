import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service functions
const apiService = {
  // Auth endpoints
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  googleLogin: (tokenId) => apiClient.post('/auth/google-login', { token_id: tokenId }),
  
  // URL analysis endpoints
  analyzeUrl: (url) => apiClient.post('/api/analyze', { url }),
  
  // User dashboard endpoints
  getDashboard: (userId) => apiClient.get(`/dashboard/${userId}`),
  
  // Watchlist endpoints
  getWatchlist: () => apiClient.get('/watchlist'),
  
  // Feedback endpoint
  submitFeedback: (feedback) => apiClient.post('/feedback', feedback),
};

export default apiService;