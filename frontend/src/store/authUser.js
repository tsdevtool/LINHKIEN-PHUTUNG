import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isCheckingAuth: false,

  signup: async (credentials) => {
    set({ isSigningUp: true });
    try {
      const response = await axios.post("/api/v1/auth/signup", credentials);
      set({ user: response.data?.user, isSigningUp: false });
      toast.success("Tài khoản đã được đăng ký");
    } catch (error) {
      toast.error(error.response.data.message || "Lỗi đăng ký");
      set({ isSigningUp: false, user: null });
    }
  },

  login: async (credentals) => {
    set({ isLoggingIn: true });
    try {
      const response = await axios.post("/api/v1/auth/login", credentals);
      set({ user: response.data.user, isLoggingIn: false });
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      toast.error(error.response.data.message || "Lỗi đăng nhập");
      set({ isLoggingIn: false, user: null });
    }
  },

  logout: async () => {
    set({ isLoggingOut: true });
    try {
      await axios.post("/api/v1/auth/logout");
      set({ user: null, isLoggingOut: false });
    } catch (error) {
      set({ isLoggingOut: false });
      toast.error(error.response.data.message || "Lỗi đăng xuất");
    }
  },

  authCheck: async () => {
    set({ isCheckingAuth: true });
    try {
      const response = await axios.get("/api/v1/auth/auth-check");
      set({ user: response.data.user, isCheckingAuth: false });
    } catch (error) {
      set({ isCheckingAuth: false, user: null });
      //   toast.error(
      //     error.response.data.message ||
      //       "Có lỗi gì đó khi chúng tôi kiểm tra thông tin của bạn"
      //   );
    }
  },
}));
