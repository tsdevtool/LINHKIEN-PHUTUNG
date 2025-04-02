import { create } from 'zustand';
import axiosInstance from '../../config/axios';
import { toast } from 'react-hot-toast';

const useOrderStore = create((set) => ({
  isLoading: false,
  error: null,
  orderData: null,
  orders: [],

  getAllOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('customer/orders');
      
      if (response.data.success) {
        set({ orders: response.data.data || [] });
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Get orders error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createOrderFromCart: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      // Format the order data according to API specification
      const formattedOrderData = {
        cart_item_ids: orderData.cart_item_ids,
        recipient_name: orderData.recipient_name,
        recipient_phone: orderData.recipient_phone,
        recipient_address: orderData.recipient_address,
        payment_type: orderData.payment_type,      // "cash" hoặc "payos"
        order_method: orderData.order_method,      // "delivery" hoặc "store_pickup"
        discount: orderData.discount || 0,         // tùy chọn
        message: orderData.message || ""           // tùy chọn
      };

      console.log('Formatted order data:', formattedOrderData);

      const response = await axiosInstance.post(
        'customer/orders/create-from-cart',
        formattedOrderData
      );
      
      if (response.data.success) {
        set({ orderData: response.data.data });
        toast.success('Đặt hàng thành công!');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errorMessage = error.response?.data?.message || error.message;
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearOrderData: () => {
    set({ orderData: null, error: null });
  }
}));

export default useOrderStore;
