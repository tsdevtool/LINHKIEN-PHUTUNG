import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const {
    PAYOS_CLIENT_ID,
    PAYOS_API_KEY,
    PAYOS_CHECKSUM_KEY,
    PAYOS_RETURN_URL,
    PAYOS_CANCEL_URL,
    PAYOS_WEBHOOK_URL
} = process.env;

const API_URL = 'https://api-merchant.payos.vn/v2';

class PayOSService {
    constructor() {
        if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
            throw new Error('Missing PayOS configuration');
        }
    }

    // Tạo chữ ký cho request
    createSignature(data) {
        try {
            // Chỉ lấy các trường bắt buộc theo thứ tự của PayOS
            const requiredFields = {
                amount: data.amount,
                cancelUrl: data.cancelUrl,
                description: data.description,
                orderCode: data.orderCode,
                returnUrl: data.returnUrl
            };

            // Tạo chuỗi theo format của PayOS
            const signData = Object.keys(requiredFields)
                .sort()
                .map(key => `${key}=${requiredFields[key]}`)
                .join('&');
                
            console.log('Data to sign:', signData);

            const signature = crypto
                .createHmac('sha256', PAYOS_CHECKSUM_KEY)
                .update(signData)
                .digest('hex');

            console.log('Generated signature:', signature);
            return signature;
        } catch (error) {
            console.error('Error creating signature:', error);
            throw error;
        }
    }

    // Tạo payment link
    async createPayment(order, returnOptions = {}) {
        try {
            console.log('Creating PayOS payment for order:', order);

            // Tạo mã đơn hàng PayOS từ order number
            const payosOrderCode = parseInt(Date.now());

            // Đảm bảo amount là số hợp lệ
            const amount = Math.round(order.finaltotal || 0);
            if (!amount || isNaN(amount) || amount <= 0) {
                throw new Error('Số tiền thanh toán không hợp lệ');
            }

            // Thêm order_number vào URL parameters
            const baseReturnUrl = returnOptions.return_url || PAYOS_RETURN_URL;
            const baseCancelUrl = returnOptions.cancel_url || PAYOS_CANCEL_URL;

            // Thêm order_number vào URL
            const returnUrl = `${baseReturnUrl}${baseReturnUrl.includes('?') ? '&' : '?'}order_number=${order.order_number}`;
            const cancelUrl = `${baseCancelUrl}${baseCancelUrl.includes('?') ? '&' : '?'}order_number=${order.order_number}`;

            // Tạo dữ liệu cơ bản
            const baseData = {
                orderCode: payosOrderCode,
                amount: amount,
                description: `TT ${order.order_number}`,
                cancelUrl: cancelUrl,
                returnUrl: returnUrl
            };

            // Tạo chữ ký từ dữ liệu cơ bản
            const signature = this.createSignature(baseData);

            // Thêm các trường bổ sung vào payment data
            const paymentData = {
                ...baseData,
                signature,
                webHookUrl: PAYOS_WEBHOOK_URL || 'https://localhost:3000/api/v1/orders/payment/webhook',
                customerEmail: order.customer_info?.email || '',
                customerPhone: order.customer_info?.phone || '',
                customerName: order.customer_info?.name || '',
                orderReference: order.order_number
            };

            console.log('PayOS payment data:', paymentData);

            const response = await axios.post(
                `${API_URL}/payment-requests`,
                paymentData,
                {
                    headers: {
                        'x-client-id': PAYOS_CLIENT_ID,
                        'x-api-key': PAYOS_API_KEY,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('PayOS API response:', response.data);

            if (response.data.code === '00') {
                return {
                    success: true,
                    checkoutUrl: response.data.data.checkoutUrl,
                    paymentLinkId: response.data.data.paymentLinkId
                };
            } else {
                throw new Error(response.data.desc || 'PayOS API error');
            }
        } catch (error) {
            console.error('PayOS payment creation error:', error.response?.data || error);
            throw new Error('Không thể tạo yêu cầu thanh toán: ' + (error.response?.data?.desc || error.message));
        }
    }

    // Xác thực webhook từ PayOS
    verifyWebhookSignature(payload, signature) {
        const calculatedSignature = this.createSignature(payload);
        return calculatedSignature === signature;
    }

    // Kiểm tra trạng thái thanh toán
    async checkPaymentStatus(orderCode) {
        try {
            const response = await axios.get(
                `${API_URL}/payment-requests/${orderCode}`,
                {
                    headers: {
                        'x-client-id': PAYOS_CLIENT_ID,
                        'x-api-key': PAYOS_API_KEY
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('PayOS payment status check error:', error.response?.data || error);
            throw new Error('Không thể kiểm tra trạng thái thanh toán');
        }
    }
}

export default new PayOSService(); 