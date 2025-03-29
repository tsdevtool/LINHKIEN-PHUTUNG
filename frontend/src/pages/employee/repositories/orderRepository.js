import axios from 'axios';

const NODE_API_URL = import.meta.env.VITE_BACKEND_URL + '/api/v1';
const PHP_API_URL = 'http://localhost:8000/api';

class OrderRepository {
    async getAllProducts() {
        try {
            const response = await axios.get(`${PHP_API_URL}/products`);
            return response.data.products || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async createOrder(orderData) {
        try {
            // Đảm bảo định dạng dữ liệu đúng trước khi gửi
            const formattedOrderData = {
                ...orderData,
                // Đảm bảo staffId là string
                staffId: typeof orderData.staffId === 'object' ? orderData.staffId.id || orderData.staffId._id : orderData.staffId,
                // Đảm bảo customerInfo có đủ trường
                customerInfo: {
                    ...orderData.customerInfo,
                    // Thêm address nếu thiếu
                    address: orderData.customerInfo.address || 'Chưa cập nhật'
                },
                // Map payment method
                paymentMethod: this.mapPaymentMethod(orderData.paymentMethod)
            };

            console.log('Sending order data:', formattedOrderData);
            
            const response = await axios.post(`${NODE_API_URL}/orders`, formattedOrderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error.response?.data || error.message);
            throw error;
        }
    }

    // Ánh xạ phương thức thanh toán
    mapPaymentMethod(method) {
        const mapping = {
            'Tiền mặt': 'cash',
            'Chuyển khoản': 'bank_transfer',
            'Thẻ tín dụng': 'credit_card',
            'Ví Momo': 'momo',
            'ZaloPay': 'zalopay',
            'VNPay': 'vnpay',
            'COD (Thu hộ)': 'cod'
        };
        
        return mapping[method] || method;
    }

    async searchProducts(query) {
        try {
            const response = await axios.get(`${PHP_API_URL}/products/search?q=${query}`);
            return response.data.products || [];
        } catch (error) {
            console.error('Error searching products:', error);
            throw error;
        }
    }

    async getOrders() {
        try {
            const response = await axios.get(`${NODE_API_URL}/orders`);
            return response.data.orders || [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    async getOrderById(id) {
        try {
            const response = await axios.get(`${NODE_API_URL}/orders/${id}`);
            return response.data.order;
        } catch (error) {
            console.error(`Error fetching order with id ${id}:`, error);
            throw error;
        }
    }

    async updateOrder(id, orderData) {
        try {
            const response = await axios.put(`${NODE_API_URL}/orders/${id}`, orderData);
            return response.data;
        } catch (error) {
            console.error(`Error updating order with id ${id}:`, error);
            throw error;
        }
    }

    async cancelOrder(id) {
        try {
            const response = await axios.put(`${NODE_API_URL}/orders/${id}/cancel`);
            return response.data;
        } catch (error) {
            console.error(`Error cancelling order with id ${id}:`, error);
            throw error;
        }
    }
}

export default new OrderRepository(); 