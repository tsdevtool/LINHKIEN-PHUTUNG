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

// Helper function to get token from cookie
const getTokenFromCookie = () => {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; jwt-phutung=`);
    if (parts.length === 2) {
      let token = parts.pop().split(';').shift();
      
      // Clean the token
      token = token.trim();
      // Remove quotes if present
      token = token.replace(/^["'](.+(?=["']$))["']$/, '$1');
      // Decode URI component if encoded
      try {
        token = decodeURIComponent(token);
      } catch (e) {
        // If decoding fails, use original token
        console.log('Token is not URI encoded');
      }

      return token;
    }
    
    return null;
  } catch (error) {
   
    return null;
  }
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from cookie
    const token = getTokenFromCookie();

    // Add token to headers if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
    } else {
     
    }

    // Log request details
    console.log('Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token
    });

    return config;
  },
  (error) => {
  
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log response details
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    });
    return Promise.reject(error);
  }
);

// Thêm helper function để kiểm tra auth state
axiosInstance.checkAuth = async () => {
  try {
    const response = await axiosInstance.get('/v1/auth/auth-check', {
      withCredentials: true
    });
    return response.data?.success || false;
  } catch (error) {
    return false;
  }
};

export default axiosInstance; 