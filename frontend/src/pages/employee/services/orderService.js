import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000, // timeout sau 10 giây
    headers: {
        'Content-Type': 'application/json'
    }
});

class OrderService {
    async createOrder(orderData) {
        try {
            // Log request data
            console.log('Creating order with data:', orderData);
            
            const response = await axiosInstance.post('/orders', orderData);
            console.log('API Response:', response);
            
            // Kiểm tra response
            if (!response.data) {
                throw new Error('Không nhận được phản hồi từ server');
            }
            
            return response.data;
        } catch (error) {
            console.error('Order API Error:', {
                message: error.message,
                response: error.response,
                data: error.response?.data
            });

            // Xử lý lỗi trùng mã đơn hàng
            if (error.response?.data?.message?.includes('duplicate key error') || 
                error.response?.data?.message?.includes('E11000')) {
                throw new Error('Mã đơn hàng đã tồn tại, vui lòng thử lại');
            }

            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi tạo đơn hàng'
            );
        }
    }

    async getOrders() {
        try {
            console.log('Fetching orders from:', `${API_URL}/orders`);
            const response = await axiosInstance.get('/orders');
            console.log('Get Orders Response:', response);

            if (!response || !response.data) {
                console.warn('Empty response from API:', response);
                return [];
            }

            // Kiểm tra cấu trúc response
            let orders = [];
            if (Array.isArray(response.data)) {
                orders = response.data;
            } else if (response.data.orders && Array.isArray(response.data.orders)) {
                orders = response.data.orders;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                orders = response.data.data;
            }

            return orders;
        } catch (error) {
            console.error('Get Orders Error:', {
                message: error.message,
                response: error.response,
                status: error.response?.status
            });

            if (error.code === 'ECONNREFUSED') {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra server đã chạy chưa.');
            }

            if (error.code === 'ETIMEDOUT') {
                throw new Error('Kết nối tới server quá thời gian chờ. Vui lòng thử lại.');
            }

            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi tải danh sách đơn hàng'
            );
        }
    }

    async getOrderById(id) {
        try {
            console.log('Fetching order details:', id);
            const response = await axiosInstance.get(`/orders/${id}`);
            console.log('Get Order Details Response:', response);

            if (!response.data) {
                throw new Error('Không tìm thấy thông tin đơn hàng');
            }

            return response.data;
        } catch (error) {
            console.error('Get Order Details Error:', {
                orderId: id,
                message: error.message,
                response: error.response
            });

            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy đơn hàng');
            }

            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi tải thông tin đơn hàng'
            );
        }
    }

    async updateOrder(id, orderData) {
        try {
            console.log('Updating order:', id, orderData);
            const response = await axiosInstance.put(`/orders/${id}`, orderData);
            console.log('Update Order Response:', response);

            if (!response.data) {
                throw new Error('Không nhận được phản hồi khi cập nhật đơn hàng');
            }

            return response.data;
        } catch (error) {
            console.error('Update Order Error:', {
                orderId: id,
                message: error.message,
                response: error.response
            });

            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi cập nhật đơn hàng'
            );
        }
    }

    async deleteOrder(id) {
        try {
            console.log('Deleting order:', id);
            const response = await axiosInstance.delete(`/orders/${id}`);
            console.log('Delete Order Response:', response);

            return response.data;
        } catch (error) {
            console.error('Delete Order Error:', {
                orderId: id,
                message: error.message,
                response: error.response
            });

            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi xóa đơn hàng'
            );
        }
    }
}

export default new OrderService(); 