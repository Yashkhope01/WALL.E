import axios from 'axios';

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
});

// Add auth token to requests
API.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const { token } = JSON.parse(auth);
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle expired/invalid token — redirect to login
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

