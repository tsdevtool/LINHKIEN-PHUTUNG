import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(true);

    // Lấy và decode thông tin từ URL parameters
    const orderCode = searchParams.get('orderCode');
    const order_number = searchParams.get('order_number');
    const returnUrl = searchParams.get('returnUrl');
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');

    // Hàm kiểm tra và lấy route prefix
    const getRoutePrefix = () => {
        const isAdminRoute = location.pathname.startsWith('/admin');
        return isAdminRoute ? '/admin' : '/employee';
    };

    // Nếu order_number không có trong URL trực tiếp, thử tìm trong returnUrl
    const getOrderNumberFromUrl = () => {
        if (order_number) return order_number;
        
        try {
            // Nếu có returnUrl, parse nó để lấy order_number
            if (returnUrl) {
                const decodedReturnUrl = decodeURIComponent(returnUrl);
                const returnUrlParams = new URLSearchParams(decodedReturnUrl);
                const orderNumberFromReturn = returnUrlParams.get('order_number');
                if (orderNumberFromReturn) return orderNumberFromReturn;
            }
            
            // Nếu không tìm thấy trong returnUrl, thử tìm trong full URL
            const fullUrl = window.location.href;
            const urlObj = new URL(fullUrl);
            return urlObj.searchParams.get('order_number');
        } catch (err) {
            return null;
        }
    };

    useEffect(() => {
        const updatePaymentStatus = async () => {
            try {
                const actualOrderNumber = getOrderNumberFromUrl();

                // Đảm bảo token có sẵn từ localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    axios.defaults.withCredentials = true;
                }

                // Tìm và cập nhật trạng thái thanh toán theo order_number
                if (actualOrderNumber) {
                    const apiUrl = `${import.meta.env.VITE_PHP_URL}/orders/find-by-number/${actualOrderNumber}`;

                    try {
                        // Đầu tiên tìm đơn hàng theo order_number
                        const findOrderResponse = await axios.get(apiUrl);
                        
                        if (findOrderResponse.data && findOrderResponse.data.order) {
                            const orderId = findOrderResponse.data.order._id;
                            
                            // Sau đó cập nhật trạng thái
                            const updateUrl = `${import.meta.env.VITE_PHP_URL}/orders/update-by-number/${actualOrderNumber}`;
                            
                            // Chuẩn bị dữ liệu một cách cẩn thận để tránh undefined
                            const updateData = {
                                payment_status: 'paid',
                                status: 'confirmed',
                                payment_info: {
                                    provider: 'PayOS',
                                    payment_id: orderCode || '',
                                    status: 'paid',
                                    paid_at: new Date().toISOString(),
                                    amount: amount ? parseInt(amount) : 0
                                }
                            };
                            
                            await axios.put(updateUrl, updateData);
                        } else {
                            throw new Error('Không tìm thấy đơn hàng');
                        }
                    } catch (apiError) {
                        throw apiError;
                    }
                } else {
                    // Thử lấy từ URL trực tiếp một lần nữa
                    const orderNumberFromQueryString = new URLSearchParams(window.location.search).get('order_number');
                    
                    if (orderNumberFromQueryString) {
                        const apiUrl = `${import.meta.env.VITE_PHP_URL}/orders/find-by-number/${orderNumberFromQueryString}`;
                        // ...tiếp tục xử lý như trên
                    } else {
                        throw new Error('Không có mã đơn hàng');
                    }
                }
            } catch (err) {
                setError('Không thể cập nhật trạng thái thanh toán: ' + (err.response?.data?.message || err.message));
            } finally {
                setIsUpdating(false);
            }
        };

        // Gọi hàm cập nhật trạng thái
        updatePaymentStatus();
    }, [searchParams, orderCode, order_number, amount, returnUrl]);

    // Xử lý đếm ngược và chuyển hướng trong useEffect riêng
    useEffect(() => {
        if (!isUpdating) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        if (returnUrl) {
                            navigate(decodeURIComponent(returnUrl));
                        } else {
                            const routePrefix = getRoutePrefix();
                            navigate(`${routePrefix}/orders`);
                        }
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [isUpdating, navigate, returnUrl, location]);

    // Hàm xử lý chuyển hướng
    const handleNavigation = () => {
        if (returnUrl) {
            navigate(decodeURIComponent(returnUrl));
        } else {
            const routePrefix = getRoutePrefix();
            navigate(`${routePrefix}/orders`);
        }
    };

    const actualOrderNumber = getOrderNumberFromUrl();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Thanh toán thành công!
                </h1>
                <div className="text-gray-600 space-y-2 mb-6">
                    {actualOrderNumber && (
                        <p>Mã đơn hàng: <span className="font-medium">{actualOrderNumber}</span></p>
                    )}
                    {amount && (
                        <p>Số tiền: <span className="font-medium">
                            {parseInt(amount).toLocaleString()}đ
                        </span></p>
                    )}
                    {description && (
                        <p>Nội dung: <span className="font-medium">{description}</span></p>
                    )}
                </div>
                {error && (
                    <p className="text-red-500 mb-4">{error}</p>
                )}
                <p className="text-sm text-gray-500">
                    {isUpdating ? 'Đang cập nhật trạng thái thanh toán...' : `Tự động chuyển hướng sau ${countdown} giây...`}
                </p>
                <button
                    onClick={handleNavigation}
                    className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                    Xem đơn hàng
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess; 