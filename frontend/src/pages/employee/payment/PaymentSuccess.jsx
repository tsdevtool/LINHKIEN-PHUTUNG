import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);

    // Lấy thông tin từ URL parameters
    const orderCode = searchParams.get('orderCode');
    const amount = searchParams.get('amount');
    const description = searchParams.get('description');

    useEffect(() => {
        // Đếm ngược và chuyển hướng về trang danh sách đơn hàng
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Kiểm tra nếu URL chứa returnUrl thì chuyển hướng đến đó
                    const returnUrl = searchParams.get('returnUrl');
                    if (returnUrl) {
                        navigate(returnUrl);
                    } else {
                        navigate('/employee/orders');
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, searchParams]);

    // Hàm xử lý chuyển hướng
    const handleNavigation = () => {
        const returnUrl = searchParams.get('returnUrl');
        if (returnUrl) {
            navigate(returnUrl);
        } else {
            navigate('/employee/orders');
        }
    };

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
                    {orderCode && (
                        <p>Mã đơn hàng: <span className="font-medium">{orderCode}</span></p>
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
                <p className="text-sm text-gray-500">
                    Tự động chuyển hướng sau {countdown} giây...
                </p>
                <button
                    onClick={handleNavigation}
                    className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                    Xem danh sách đơn hàng
                </button>
            </div>
        </div>
    );
};

export default PaymentSuccess; 