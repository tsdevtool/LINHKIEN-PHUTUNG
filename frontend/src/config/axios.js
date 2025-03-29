import axios from 'axios';
import { PHP_API_URL } from './api';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: PHP_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Debug function to log request details
const logRequestDetails = (config) => {
  console.log('Request Details:', {
    url: config.url,
    fullUrl: config.baseURL + config.url,
    method: config.method,
    headers: config.headers,
  });
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Skip token for login and signup
    if (token && !config.url.includes('/auth/login') && !config.url.includes('/auth/signup')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Log request details
    console.log('Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      headers: config.headers
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors
    if (error.response?.status === 401 && 
        !error.config.url.includes('/auth/login') && 
        !error.config.url.includes('/auth/signup')) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.replace('/auth/login');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 