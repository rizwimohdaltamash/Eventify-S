import axios from 'axios';
import { getToken } from '../lib/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://eventify-s-backend.onrender.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
