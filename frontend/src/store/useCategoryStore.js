import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set) => ({
  categories: [],
  isLoading: false,

  getAllCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get("/api/v1/categories");
      set({ categories: response.data.categories });
    } catch (error) {
      console.error("Lỗi khi lấy danh mục:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addOrUpdateCategory: async (categoryData, categoryId) => {
    set({ isLoading: true });
    try {
      if (categoryId) {
        await axios.put(`/api/v1/category/edit/${categoryId}`, categoryData);
      } else {
        await axios.post("/api/v1/category", categoryData);
      }
      await useCategoryStore.getState().getAllCategories();
      toast.success("Cập nhật thành công");
    } catch (error) {
      toast.error("Cập nhật thất bại");
      console.error("Lỗi khi cập nhật danh mục:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (categoryId) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/api/v1/category/delete/${categoryId}`);
      await useCategoryStore.getState().getAllCategories();
      toast.success(`Xoá danh mục ${categoryId} thành công`);
    } catch (error) {
      toast.error(`Xoá danh mục ${categoryId} thành công`);
      console.error("Lỗi khi xóa danh mục:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
