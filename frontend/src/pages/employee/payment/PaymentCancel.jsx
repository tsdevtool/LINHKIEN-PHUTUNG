import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import axios from 'axios';

const PaymentCancel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);

    // Lấy thông tin từ URL parameters
    const orderCode = searchParams.get('orderCode');
    const reason = searchParams.get('reason');

    // Hàm kiểm tra và lấy route prefix
    const getRoutePrefix = () => {
        const isAdminRoute = location.pathname.startsWith('/admin');
        return isAdminRoute ? '/admin' : '/employee';
    };

    useEffect(() => {
        // Đảm bảo token có sẵn từ localStorage
        const token = localStorage.getItem('token');
        
        // Nếu không có token, thử lấy từ cookie
        if (!token) {
            // Đặt lại axios instance với cookie
            axios.defaults.withCredentials = true;
        }
    
        // Đếm ngược và chuyển hướng về trang danh sách đơn hàng
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Kiểm tra nếu URL chứa returnUrl thì chuyển hướng đến đó
                    const returnUrl = searchParams.get('returnUrl');
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
    }, [navigate, searchParams, location]);

    // Hàm xử lý chuyển hướng
    const handleNavigation = (path) => {
        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl) {
            navigate(decodeURIComponent(returnUrl));
        } else {
            const routePrefix = getRoutePrefix();
            const finalPath = path === '/employee/orders' ? `${routePrefix}/orders` : `${routePrefix}/orders/${orderCode}`;
            navigate(finalPath);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Thanh toán không thành công
                </h1>
                <div className="text-gray-600 space-y-2 mb-6">
                    {orderCode && (
                        <p>Mã đơn hàng: <span className="font-medium">{orderCode}</span></p>
                    )}
                    {reason && (
                        <p>Lý do: <span className="font-medium">{reason}</span></p>
                    )}
                    <p>Bạn có thể thử thanh toán lại từ trang chi tiết đơn hàng</p>
                </div>
                <p className="text-sm text-gray-500">
                    Tự động chuyển hướng sau {countdown} giây...
                </p>
                <div className="mt-6 space-y-3">
                    <button
                        onClick={() => handleNavigation('/employee/orders')}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Xem danh sách đơn hàng
                    </button>
                    <button
                        onClick={() => handleNavigation(`/employee/orders/${orderCode}`)}
                        className="w-full border border-blue-500 text-blue-500 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        Xem chi tiết đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel; 