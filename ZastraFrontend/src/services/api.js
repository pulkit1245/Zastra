import axios from 'axios';

/**
 * Base URL resolution:
 *  - Local dev:  http://localhost:8080  (Vite proxy also handles /api/* → 8080)
 *  - Render prod: set VITE_API_URL=https://zastra-backend.onrender.com
 *                 in the Render Static Site environment variables.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zastra_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('zastra_token');
      localStorage.removeItem('zastra_user_id');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
