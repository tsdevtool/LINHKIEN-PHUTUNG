import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set, get) => ({
  categories: [],
  category: null,
  trashedCategories: [],
  isLoading: false,

  // Lấy tất cả danh mục dạng cây
  getAllCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get("/api/categories");
      set({ categories: response.data.categories || [] });
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
      toast.error("Không thể tải danh mục");
      set({ categories: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // Lấy chi tiết một danh mục
  getCategoryById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/api/categories/${id}`);
      set({ category: response.data });
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết danh mục:", error);
      toast.error("Không thể tải chi tiết danh mục");
    } finally {
      set({ isLoading: false });
    }
  },

  // Thêm danh mục mới
  addCategory: async (categoryData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post("/api/categories", categoryData);
      await get().getAllCategories();
      toast.success("Thêm danh mục thành công");
      return response;
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      toast.error("Thêm danh mục thất bại");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Cập nhật danh mục
  updateCategory: async (id, categoryData) => {
    set({ isLoading: true });
    try {
      await axios.put(`/api/categories/${id}`, categoryData);
      await get().getAllCategories();
      toast.success("Cập nhật danh mục thành công");
    } catch (error) {
      console.error("Lỗi khi cập nhật danh mục:", error);
      toast.error("Cập nhật danh mục thất bại");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Xóa mềm danh mục
  softDeleteCategory: async (id) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/api/categories/${id}`);
      await get().getAllCategories();
      await get().getTrashedCategories();
      toast.success("Đã chuyển danh mục vào thùng rác");
    } catch (error) {
      console.error("Lỗi khi xóa danh mục:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        throw error;
      }
      toast.error("Không thể xóa danh mục");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Khôi phục danh mục đã xóa
  restoreCategory: async (id) => {
    set({ isLoading: true });
    try {
      await axios.post(`/api/categories/${id}/restore`);
      await get().getAllCategories();
      await get().getTrashedCategories();
      toast.success("Khôi phục danh mục thành công");
    } catch (error) {
      console.error("Lỗi khi khôi phục danh mục:", error);
      toast.error("Không thể khôi phục danh mục");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Xóa vĩnh viễn danh mục
  forceDeleteCategory: async (id) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/api/categories/${id}/force`);
      await get().getTrashedCategories();
      toast.success("Đã xóa vĩnh viễn danh mục");
    } catch (error) {
      console.error("Lỗi khi xóa vĩnh viễn danh mục:", error);
      toast.error("Không thể xóa vĩnh viễn danh mục");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Lấy danh sách danh mục đã xóa
  getTrashedCategories: async () => {
    try {
      const response = await axios.get("/api/categories/trashed");
      set({
        trashedCategories: Array.isArray(response.data) ? response.data : [],
      });
    } catch (error) {
      if (error.response?.status === 404) {
        set({ trashedCategories: [] });
      } else {
        console.error("Lỗi khi lấy danh mục đã xóa:", error);
        toast.error("Không thể tải danh mục đã xóa");
        set({ trashedCategories: [] });
      }
    }
  },
}));
