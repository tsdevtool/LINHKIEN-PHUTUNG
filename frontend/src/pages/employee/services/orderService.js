import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL + '/api/v1';

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
            // Validate required fields
            if (!orderData.customer_info || !orderData.customer_info.name) {
                throw new Error('Thiếu thông tin khách hàng');
            }

            if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
                throw new Error('Thiếu thông tin sản phẩm');
            }

            // Log request data
            console.log('Creating order with data:', JSON.stringify(orderData, null, 2));
            
            // Format data before sending
            const { orderNumber, ...orderDataWithoutNumber } = orderData;
            
            // Ensure all required fields are present and properly formatted
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
                staff_id: orderData.staff_id,
                staff_info: {
                    name: orderData.staff_info.name,
                    role: 'employee'
                },
                status: orderData.status,
                note: orderData.note || ''
            };
            
            console.log('Formatted data to send:', JSON.stringify(formattedData, null, 2));
            
            const response = await axiosInstance.post('/orders', formattedData);
            console.log('API Response:', response);
            
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

    // Map payment method from UI to acceptable values in model
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
            if (!id) {
                throw new Error('ID đơn hàng không hợp lệ');
            }

            console.log('Fetching order details for ID:', id);
            const response = await axiosInstance.get(`/orders/${id}`);
            console.log('Raw API Response:', response);

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
                console.error('Invalid order data structure:', response.data);
                throw new Error('Cấu trúc dữ liệu đơn hàng không hợp lệ');
            }

            console.log('Processed order data:', orderData);
            return {
                success: true,
                order: orderData
            };
        } catch (error) {
            console.error('Get Order Details Error:', {
                orderId: id,
                message: error.message,
                response: error.response,
                stack: error.stack
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
            if (!id) {
                throw new Error('ID đơn hàng không hợp lệ');
            }

            // Kiểm tra xem dữ liệu cập nhật có null không
            console.log('Updating order:', id);
            console.log('Update data (raw):', orderData);
            console.log('Update data JSON:', JSON.stringify(orderData));

            // Test API trực tiếp với Axios (không qua instance)
            try {
                console.log(`Direct API URL: ${API_URL}/orders/${id}`);
                const directResponse = await axios({
                    method: 'put',
                    url: `${API_URL}/orders/${id}`,
                    data: orderData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Direct Axios Response:', directResponse);
            } catch (directError) {
                console.error('Direct API call failed:', directError);
            }

            // Tiếp tục với axiosInstance
            const response = await axiosInstance.put(`/orders/${id}`, orderData);
            console.log('Update Order Response:', response);
            console.log('Response data:', response.data);
            
            // Log HTTP status
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

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
            console.error('Update Order Error:', {
                orderId: id,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stack: error.stack
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

    // Hủy đơn hàng
    async cancelOrder(orderId, reason) {
        try {
            const response = await axiosInstance.put(`/orders/${orderId}/cancel`, {
                cancelReason: reason,
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
            console.error('Error cancelling order:', error);
            throw error;
        }
    }
}

export default new OrderService(); 