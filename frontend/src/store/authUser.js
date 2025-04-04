import toast from "react-hot-toast";
import { create } from "zustand";
import axiosInstance from "../config/axios";

const initialState = {
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isAuthChecking: false,
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
      
      if (response.data?.success && response.data?.user) {
        set({ user: response.data?.user, isSigningUp: false });
        toast.success("Tài khoản đã được đăng ký");
        window.location.href = '/auth/login';
      } else {
        throw new Error(response.data?.message || 'Đăng ký thất bại');
      }
    } catch (error) {
     
      toast.error(error.response?.data?.message || "Lỗi đăng ký");
      set({ isSigningUp: false, user: null });
    }
  },

  login: async (credentials) => {
    if (get().isLoggingIn) return;

    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/v1/auth/login", credentials);

      if (!response.data?.success || !response.data?.user) {
        throw new Error('Invalid login response');
      }

      // Cập nhật user state
      set({ 
        user: response.data.user, 
        isLoggingIn: false 
      });

      toast.success("Đăng nhập thành công!");
      return response.data.user;

    } catch (error) {
      console.error('Login failed:', error);
      set({ isLoggingIn: false, user: null });
      toast.error(error.response?.data?.message || "Lỗi đăng nhập");
      throw error;
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axiosInstance.post("/v1/auth/logout");
      set({ ...initialState });
      window.location.href = '/auth/login';
    } catch (error) {
     
      set({ isLoggingOut: false });
      toast.error("Lỗi đăng xuất");
    }
  },

  authCheck: async () => {
    const currentState = get();
    
    if (currentState.isAuthChecking) {
      return currentState.user;
    }

    set({ isAuthChecking: true });

    try {
      const response = await axiosInstance.get("/v1/auth/auth-check");

      if (response.data?.success && response.data?.user) {
        set({ user: response.data.user });
        return response.data.user;
      } else {
        set({ user: null });
        return null;
      }
    } catch (error) {
    
      set({ user: null });
      return null;
    } finally {
      set({ isAuthChecking: false });
    }
  },

  resetAuth: () => {
    set({ ...initialState });
  }
}));
