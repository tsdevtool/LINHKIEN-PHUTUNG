import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useProductStore = create((set) => ({
  products: [],
  isLoadingProduct: false,

  getAllProducts: async () => {
    set({ isLoadingProduct: true });
    try {
      const response = await axios.get("/api/v1/products");
      set({ products: response.data.products, isLoadingProduct: false });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      set({ isLoadingProduct: false });
    }
  },
  addProduct: async (productData) => {
    set({ isLoadingProduct: true });
    try {
      const response = await axios.post("/api/v1/product", productData, {
        headers: { "Content-Type": "multipart/form-data" }, // Nếu có ảnh
      });
      set((state) => ({
        products: [...state.products, response.data.product],
        isLoadingProduct: false,
      }));
      toast.success("Thêm sản phẩm thành công!");
    } catch (error) {
      toast.error("Lỗi khi thêm sản phẩm:", error);
      set({ isLoadingProduct: false });
    }
  },
  updateProduct: async (id, productData) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(
        `/api/v1/product/edit/${id}`,
        productData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? response.data.product : p
        ),
        isLoading: false,
      }));
      toast.success(`Lưu sản phẩm thành công`);
    } catch (error) {
      toast.error("Lỗi khi cập nhật sản phẩm:", error.message);
      set({ isLoading: false });
    }
  },
  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/api/v1/product/delete/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
      toast.success(`Xoá sản phẩm ${id} thành công`);
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm:", error.message);
      set({ isLoading: false });
    }
  },
}));
