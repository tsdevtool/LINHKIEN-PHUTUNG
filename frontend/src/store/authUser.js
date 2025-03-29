import toast from "react-hot-toast";
import { create } from "zustand";
import axiosInstance from "../config/axios";

const initialState = {
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isCheckingAuth: false,
};

const getRedirectPath = (user) => {
  if (!user || !user.role) return '/';
  
  const role = user.role?.name || user.role;
  if (typeof role !== 'string') return '/';

  const normalizedRole = role.toLowerCase().trim();
  
  switch (normalizedRole) {
    case 'admin':
      return '/admin';
    case 'employee':
      return '/employee';
    default:
      return '/';
  }
};

export const useAuthStore = create((set, get) => ({
  ...initialState,

  signup: async (credentials) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/v1/auth/signup", credentials);
      
      if (response.data?.success && response.data?.token) {
        localStorage.setItem('token', response.data.token);
        set({ user: response.data?.user, isSigningUp: false });
        toast.success("Tài khoản đã được đăng ký");
        window.location.href = '/auth/login';
      } else {
        throw new Error(response.data?.message || 'Token not received during signup');
      }
    } catch (error) {
      console.error('Signup error:', error);
      localStorage.removeItem('token');
      toast.error(error.response?.data?.message || "Lỗi đăng ký");
      set({ isSigningUp: false, user: null });
    }
  },

  login: async (credentials) => {
    if (get().isLoggingIn) return;

    set({ isLoggingIn: true });
    try {
      localStorage.removeItem('token');
      set({ user: null });
      
      const response = await axiosInstance.post("/v1/auth/login", credentials);

      if (!response.data?.success || !response.data?.token || !response.data?.user) {
        throw new Error('Invalid login response');
      }

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      set({ user, isLoggingIn: false });
      toast.success("Đăng nhập thành công!");

    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('token');
      set({ isLoggingIn: false, user: null });
      toast.error(error.response?.data?.message || "Lỗi đăng nhập");
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post("/v1/auth/logout");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({ ...initialState });
      window.location.href = '/auth/login';
    }
  },

  authCheck: async () => {
    // Prevent multiple simultaneous auth checks
    if (get().isCheckingAuth) return null;
    
    const token = localStorage.getItem('token');
    const jwt = document.cookie.includes('jwt-phutung');
    
    // Don't check if no token and no cookie
    if (!token && !jwt) {
      set({ user: null });
      return null;
    }

    set({ isCheckingAuth: true });
    try {
      const response = await axiosInstance.get("/v1/auth/auth-check");
      
      if (!response.data?.success || !response.data?.user) {
        throw new Error('Invalid auth check response');
      }

      set({ user: response.data.user, isCheckingAuth: false });
      return response.data.user;

    } catch (error) {
      console.error('Auth check failed:', error);
      // Chỉ xóa token và reset state nếu lỗi 401 Unauthorized
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        set({ ...initialState });
        window.location.href = '/auth/login';
      } else {
        // Các lỗi khác (network, 500, etc) chỉ reset trạng thái checking
        set({ isCheckingAuth: false });
      }
      return null;
    }
  },

  resetAuth: () => {
    localStorage.removeItem('token');
    set({ ...initialState });
  }
}));
