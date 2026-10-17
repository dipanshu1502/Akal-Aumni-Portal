import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Authorization Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('akal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      // Clear token if expired/invalid
      // localStorage.removeItem('akal_token');
      // localStorage.removeItem('akal_user');
    }
    return Promise.reject(error.response?.data || { status: false, message, errors: [message] });
  }
);

export default api;
