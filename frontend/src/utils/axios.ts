import axios from 'axios';
import { store } from '../store/store';
import { refreshToken, logout } from '../store/slices/authSlice';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/', // یا آدرس API شما
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // First try to get token from Redux store
    let token = store.getState().auth.token;
    
    // If not in Redux store, try localStorage
    if (!token) {
      token = localStorage.getItem('token');
    }

    console.log('Token from Redux store:', store.getState().auth.token);
    console.log('Token from localStorage:', localStorage.getItem('token'));
    console.log('Final token being used:', token);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ensure username is used instead of email for login
    if (config.url === '/api/token/' && config.method === 'post' && config.data) {
      const data = JSON.parse(config.data);
      if (data.email && !data.username) {
        config.data = JSON.stringify({
          ...data,
          username: data.email,
          email: undefined
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await store.dispatch(refreshToken());
        // After refresh, get token from localStorage
        const token = localStorage.getItem('token');
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 