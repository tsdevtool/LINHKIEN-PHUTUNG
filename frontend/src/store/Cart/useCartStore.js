import axios from "axios";
import { create } from "zustand";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cartItems: [],
  cartStatus: "pending",
  isLoading: false,

  addToCart: async (product_id, quantity = 1) => {
    set({ isLoading: true });
    try {
      const response = await axios.post("/api/cart", {
        product_id,
        quantity
      });
      
      if (response.data.success) {
        await get().getCart();
        toast.success("Đã cập nhật giỏ hàng");
        return response.data;
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Cập nhật giỏ hàng thất bại");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getCart: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.post("/api/cart/get", {
        action: "get",
        status: "pending"
      });
      
      if (response.data.success) {
        const cartData = response.data.message;
        
        if (!cartData || !cartData.items) {
          set({ 
            cartItems: [],
            cartStatus: "pending"
          });
          return response.data;
        }

        set({ 
          cartItems: cartData.items || [],
          cartStatus: cartData.status || "pending"
        });
        return response.data;
      } else {
        throw new Error(response.data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể lấy thông tin giỏ hàng");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getCartTotal: () => {
    const state = get();
    return state.cartItems.reduce((total, item) => {
      return total + (item.quantity * (item.product?.price || 0));
    }, 0);
  },

  getCartItemsCount: () => {
    const state = get();
    return state.cartItems.reduce((count, item) => count + item.quantity, 0);
  },

  resetCart: () => {
    set({ 
      cartItems: [], 
      cartStatus: "pending" 
    });
  },

  increaseQuantity: async (item) => {
    if (!item._id) {
      return await get().addToCart(item.product_id, 1);
    }
    return await get().addToCart(item.product_id, 1);
  },

  decreaseQuantity: async (item) => {
    if (item.quantity <= 1) return;
    return await get().addToCart(item.product_id, -1);
  }
}));
