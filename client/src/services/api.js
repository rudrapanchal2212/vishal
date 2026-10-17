import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://vishal-9e0y.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Dynamic request interceptor: attach fresh token to every request
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('vishal_token') ||
      localStorage.getItem('vishwa_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: only redirect to /login on 401 if not already on an auth route/page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/signup');
    const isAuthPage =
      typeof window !== 'undefined' &&
      (window.location.pathname === '/login' ||
        window.location.pathname === '/signup');

    console.error(
      'API error:',
      requestUrl,
      status,
      error.response?.data || error.message
    );

    if (status === 401 && !isAuthRoute && !isAuthPage) {
      localStorage.removeItem('vishal_token');
      localStorage.removeItem('vishwa_token');
      delete api.defaults.headers.common['Authorization'];

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
