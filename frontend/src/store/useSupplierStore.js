import { create } from "zustand";
import axios from "axios";

export const useSupplierStore = create((set) => ({
  suppliers: [],
  isLoadingSupplier: false,
  getAllSuppliers: async () => {
    set({ isLoadingSupplier: true });
    try {
      const res = await axios.get("/api/v1/suppliers");
      set({ suppliers: res.data.suppliers, isLoadingSupplier: false });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhà cung ứng", error);
      set({ isLoadingSupplier: false });
    }
  },
  getSuppliersById: async (id) => {
    set({ isLoadingSupplier: true });
    try {
      const res = await axios.get(`/api/v1/suppliers/${id}`);
      set({ suppliers: res.data.supplier, isLoadingSupplier: false });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin nhà cung ứng", error);
      set({ isLoadingSupplier: false });
    }
  },
}));
