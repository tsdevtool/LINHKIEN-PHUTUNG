import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaHome, FaFileAlt } from "react-icons/fa";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { toast } from "react-hot-toast";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isUpdating, setIsUpdating] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  // Lấy thông tin từ URL parameters
  const orderId = searchParams.get('order_id');
  const orderNumber = searchParams.get('order_number');
  const amount = searchParams.get('amount');
  const description = searchParams.get('description');

  useEffect(() => {
    const updatePaymentStatus = async () => {
      try {
        if (!orderNumber) {
          throw new Error('Không tìm thấy mã đơn hàng');
        }

        // Tìm đơn hàng theo order_number
        const findOrderResponse = await axios.get(
          `${import.meta.env.VITE_PHP_URL}/api/orders/find-by-number/${orderNumber}`
        );

        if (findOrderResponse.data && findOrderResponse.data.order) {
          setOrderDetails(findOrderResponse.data.order);

          // Cập nhật trạng thái thanh toán
          const updateUrl = `${import.meta.env.VITE_PHP_URL}/api/orders/update-by-number/${orderNumber}`;
          const updateData = {
            payment_status: 'paid',
            status: 'pending',
            payment_info: {
              provider: 'PayOS',
              payment_id: orderId || '',
              status: 'paid',
              paid_at: new Date().toISOString(),
              amount: amount ? parseInt(amount) : 0
            }
          };

          await axios.put(updateUrl, updateData);
          toast.success('Cập nhật trạng thái thanh toán thành công');
        } else {
          throw new Error('Không tìm thấy đơn hàng');
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
        setError('Không thể cập nhật trạng thái thanh toán: ' + 
          (error.response?.data?.message || error.message));
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setIsUpdating(false);
      }
    };

    if (orderNumber) {
      updatePaymentStatus();
    } else {
      setIsUpdating(false);
    }
  }, [orderNumber, orderId, amount]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Navbar />

      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-green-500 mb-6">
            <FaCheckCircle className="w-20 h-20 mx-auto" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {isUpdating ? "Đang xử lý..." : "Đặt hàng thành công!"}
          </h1>

          {error ? (
            <div className="text-red-500 mb-4">{error}</div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn sẽ được xử lý trong thời
              gian sớm nhất.
            </p>
          )}

          {orderDetails && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Chi tiết đơn hàng
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Mã đơn hàng: {orderNumber}</p>
                {amount && (
                  <p>Tổng tiền: {parseInt(amount).toLocaleString()}đ</p>
                )}
                <p>Trạng thái: {orderDetails.status === 'confirmed' ? 'Đã xác nhận' : 'Đang xử lý'}</p>

                {description && <p>Ghi chú: {description}</p>}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <FaHome />
              Về trang chủ
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="flex items-center justify-center gap-2 border border-cyan-600 text-cyan-600 px-6 py-3 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors"
            >
              <FaFileAlt />
              Xem đơn hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
