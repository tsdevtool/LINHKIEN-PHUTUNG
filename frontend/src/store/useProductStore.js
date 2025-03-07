import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

export const useProductStore = create((set, get) => ({
  products: [],
  product: null,
  trashedProducts: [],
  isLoading: false,
  totalPages: 1,
  currentPage: 1,

  // Lấy tất cả sản phẩm
  getAllProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get("/api/products");
      set({ products: response.data.products || [] });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      set({ isLoading: false });
    }
  },

  // Lấy chi tiết sản phẩm
  getProductById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/api/products/${id}`);
      set({ product: response.data.product });
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      toast.error("Không thể tải chi tiết sản phẩm");
    } finally {
      set({ isLoading: false });
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (productData) => {
    set({ isLoading: true });
    try {
      // Log request data
      console.log("Sending product data:", {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        formData: productData,
      });

      const response = await axios.post("/api/products", productData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      console.log("Server response:", response.data);

      if (response.data.status === 201) {
        await get().getAllProducts();
        toast.success(response.data.message || "Thêm sản phẩm thành công");
        return response.data;
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Detailed error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Nếu là lỗi validation (422)
      if (error.response?.status === 422) {
        // Log validation errors
        console.log("Validation errors:", error.response.data);
        // Chuyển tiếp lỗi validation để form xử lý
        throw error;
      }

      // Các lỗi khác
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === "string") {
          toast.error(error.response.data.message);
        } else {
          // Log structured error message
          console.log("Structured error message:", error.response.data.message);
          toast.error("Thêm sản phẩm thất bại");
        }
      } else {
        toast.error("Thêm sản phẩm thất bại");
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Cập nhật sản phẩm
  updateProduct: async (id, productData) => {
    set({ isLoading: true });
    try {
      const response = await axios.post(`/api/products/${id}`, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });

      if (response.data.status === 200) {
        await get().getAllProducts();
        toast.success(response.data.message || "Cập nhật sản phẩm thành công");
        return response.data;
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Cập nhật sản phẩm thất bại");
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Di chuyển sản phẩm sang danh mục khác
  moveProduct: async (productId, newCategoryId) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`/api/products/${productId}/move`, {
        category_id: newCategoryId,
      });

      if (response.data.status === 200) {
        await get().getAllProducts();
        toast.success("Di chuyển sản phẩm thành công");
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi di chuyển sản phẩm:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Di chuyển sản phẩm thất bại");
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Xóa sản phẩm (soft delete)
  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axios.delete(`/api/products/${id}`);

      if (response.data.status === 200) {
        await get().getAllProducts();
        toast.success(response.data.message || "Xóa sản phẩm thành công");
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Xóa sản phẩm thất bại");
      }
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Lấy danh sách sản phẩm đã xóa
  getTrashedProducts: async () => {
    try {
      const response = await axios.get("/api/products/trashed");
      set({
        trashedProducts: Array.isArray(response.data.products)
          ? response.data.products
          : [],
      });
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm đã xóa:", error);
      toast.error("Không thể tải sản phẩm đã xóa");
      set({ trashedProducts: [] });
    }
  },
}));
