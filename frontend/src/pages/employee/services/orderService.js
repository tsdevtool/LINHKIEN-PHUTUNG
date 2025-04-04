import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL + '/api/v1';
const PHP_API_URL = 'http://localhost:8000/api';

// Tạo instance của axios với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: PHP_API_URL,
    timeout: 10000, // timeout sau 10 giây
    headers: {
        'Content-Type': 'application/json'
    }
});

class OrderService {
    async createOrder(orderData) {
        try {
            if (!orderData.customer_info || !orderData.customer_info.name) {
                throw new Error('Thiếu thông tin khách hàng');
            }

            if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                throw new Error('Thiếu thông tin sản phẩm');
            }
            
            const { orderNumber, ...orderDataWithoutNumber } = orderData;
            
            const staffId = orderData.staff_id ? orderData.staff_id.toString() : null;
            
            const formattedData = {
                ...orderDataWithoutNumber,
                customer_id: orderData.customer_id,
                customer_info: {
                    name: orderData.customer_info.name,
                    phone: orderData.customer_info.phone,
                    address: orderData.customer_info.address || 'Chưa cập nhật',
                    email: orderData.customer_info.email || ''
                },
                items: orderData.items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total
                })),
                total_amount: orderData.total_amount,
                discount: orderData.discount || 0,
                shipping_fee: orderData.shipping_fee || 0,
                finaltotal: orderData.finaltotal,
                payment_method: this.mapPaymentMethod(orderData.payment_method),
                payment_status: orderData.payment_status,
                shipping_method: orderData.shipping_method,
                shipping_status: orderData.shipping_status,
                staff_id: staffId,
                staff_info: {
                    name: orderData.staff_info?.name || orderData.staff_name || 'Nhân viên',
                    role: 'employee'
                },
                status: orderData.status,
                note: orderData.note || ''
            };
            
            const response = await axiosInstance.post('/orders', formattedData);
            
            if (!response.data) {
                throw new Error('Không nhận được phản hồi từ server');
            }
            
            return response.data;
        } catch (error) {
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

    async getOrders() {
        try {
            const response = await axiosInstance.get('/orders');

            if (!response || !response.data) {
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
            if (!id) {
                throw new Error('ID đơn hàng không hợp lệ');
            }

            const response = await axiosInstance.get(`/orders/${id}`);
           

            // Kiểm tra và xử lý response
            let orderData = null;
            if (response.data) {
                if (response.data.order) {
                    orderData = response.data.order;
                } else if (response.data.data) {
                    orderData = response.data.data;
                } else if (typeof response.data === 'object' && !response.data.success) {
                    orderData = response.data;
                }
            }

            if (!orderData) {
                
                throw new Error('Cấu trúc dữ liệu đơn hàng không hợp lệ');
            }

           
            return {
                success: true,
                order: orderData
            };
        } catch (error) {
          

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
            if (!id) {
                throw new Error('ID đơn hàng không hợp lệ');
            }

            // Kiểm tra xem dữ liệu cập nhật có null không
          

            // Test API trực tiếp với Axios (không qua instance)
            try {
                await axios({
                    method: 'put',
                    url: `${PHP_API_URL}/orders/${id}`,
                    data: orderData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (directError) {
                // Ignore direct API call errors
            }

            // Tiếp tục với axiosInstance
            const response = await axiosInstance.put(`/orders/${id}`, orderData);
          

            if (!response.data) {
                throw new Error('Không nhận được phản hồi khi cập nhật đơn hàng');
            }

            // Trả về response data nguyên bản nếu không có cấu trúc chuẩn
            if (typeof response.data === 'object') {
                if (response.data.success === false) {
                    throw new Error(response.data.message || 'Cập nhật không thành công');
                }
                
                if (response.data.order) {
                    return {
                        success: true,
                        message: response.data.message || 'Cập nhật đơn hàng thành công',
                        order: response.data.order
                    };
                }
                
                if (response.status === 200 || response.status === 201) {
                    return {
                        success: true,
                        message: 'Cập nhật đơn hàng thành công',
                        order: response.data
                    };
                }
            }

            return {
                success: true,
                message: 'Đã gửi yêu cầu cập nhật',
                order: response.data
            };
        } catch (error) {
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi cập nhật đơn hàng'
            );
        }
    }

    async deleteOrder(id) {
        try {
            const response = await axiosInstance.delete(`/orders/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi xóa đơn hàng'
            );
        }
    }

    // Hủy đơn hàng
    async cancelOrder(orderId, reason) {
        try {
            if (!orderId) {
                throw new Error('ID đơn hàng không hợp lệ');
            }

            const response = await axiosInstance.put(`/orders/${orderId}/cancel`, {
                cancelReason: reason || 'Không có lý do',
                cancelledAt: new Date().toISOString()
            });

            if (response.data.success) {
                return {
                    success: true,
                    message: response.data.message || 'Hủy đơn hàng thành công',
                    order: response.data.order
                };
            }

            return {
                success: false,
                message: response.data.message || 'Không thể hủy đơn hàng'
            };
        } catch (error) {
            throw new Error(
                error.response?.data?.message || 
                error.message || 
                'Có lỗi xảy ra khi hủy đơn hàng'
            );
        }
    }
}

export default new OrderService();