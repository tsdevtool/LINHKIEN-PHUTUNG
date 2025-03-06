import { useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle, FaHome, FaFileAlt } from "react-icons/fa";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

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
            Đặt hàng thành công!
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn sẽ được xử lý trong thời
            gian sớm nhất.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Chi tiết đơn hàng
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Mã đơn hàng: #{orderDetails.orderId}</p>
                <p>Tổng tiền: {orderDetails.total.toLocaleString()}đ</p>
                <p>Phương thức thanh toán: Thanh toán khi nhận hàng (COD)</p>
                <p>Thời gian giao hàng dự kiến: 2-3 ngày làm việc</p>
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
              onClick={() =>
                navigate("/orders", {
                  state: {
                    orderDetails: {
                      ...orderDetails,
                      status: "processing",
                      createdAt: new Date().toISOString(),
                      paymentStatus:
                        orderDetails.paymentMethod === "cod"
                          ? "pending"
                          : "paid",
                    },
                  },
                })
              }
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
