import { useLocation } from "react-router-dom";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaCreditCard,
  FaReceipt,
} from "react-icons/fa";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";

const OrderStatusPage = () => {
  const location = useLocation();
  const orderDetails = location.state?.orderDetails || {
    orderId: "ABC123XYZ",
    status: "processing", // pending, processing, shipping, delivered, cancelled
    createdAt: "2024-03-15T10:30:00",
    total: 6770000,
    paymentMethod: "cod",
    paymentStatus: "pending", // pending, paid, failed
    shippingInfo: {
      fullName: "Nguyễn Văn A",
      phone: "0123456789",
      address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    },
    items: [
      {
        id: 1,
        name: "CPU Intel Core i5-12400F",
        image: "https://picsum.photos/900/900",
        price: 4290000,
        quantity: 1,
      },
      {
        id: 2,
        name: "RAM Kingston Fury Beast 16GB DDR4 3200MHz",
        image: "https://picsum.photos/900/900",
        price: 1290000,
        quantity: 2,
      },
    ],
  };

  const getStatusInfo = () => {
    const statuses = [
      {
        key: "pending",
        label: "Chờ xác nhận",
        icon: FaReceipt,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500",
      },
      {
        key: "processing",
        label: "Đang xử lý",
        icon: FaBox,
        color: "text-blue-500",
        bgColor: "bg-blue-500",
      },
      {
        key: "shipping",
        label: "Đang giao hàng",
        icon: FaTruck,
        color: "text-cyan-600",
        bgColor: "bg-cyan-600",
      },
      {
        key: "delivered",
        label: "Đã giao hàng",
        icon: FaCheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-500",
      },
    ];

    const currentIndex = statuses.findIndex(
      (status) => status.key === orderDetails.status
    );

    return statuses.map((status, index) => ({
      ...status,
      isCompleted: index <= currentIndex,
    }));
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tiêu đề và mã đơn hàng */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Chi tiết đơn hàng
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Mã đơn hàng: #{orderDetails.orderId}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày đặt hàng
                </p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {new Date(orderDetails.createdAt).toLocaleDateString(
                    "vi-VN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Tiến trình đơn hàng */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
              Trạng thái đơn hàng
            </h2>
            <div className="relative">
              {/* Thanh tiến trình */}
              <div className="absolute top-5 left-[2.45rem] w-[calc(100%-5rem)] h-1 bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-cyan-600 transition-all duration-300"
                  style={{
                    width: `${
                      (statusInfo.findIndex(
                        (s) => s.key === orderDetails.status
                      ) /
                        (statusInfo.length - 1)) *
                      100
                    }%`,
                  }}
                />
              </div>

              {/* Các bước trạng thái */}
              <div className="relative flex justify-between">
                {statusInfo.map((status) => (
                  <div
                    key={status.key}
                    className="flex flex-col items-center text-center"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                        status.isCompleted
                          ? status.bgColor + " text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                      }`}
                    >
                      <status.icon className="w-6 h-6" />
                    </div>
                    <p
                      className={`mt-4 text-sm font-medium ${
                        status.isCompleted
                          ? status.color
                          : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {status.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Thông tin giao hàng */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FaUser className="text-cyan-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Người nhận
                      </p>
                      <p className="text-gray-800 dark:text-white">
                        {orderDetails.shippingInfo.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaPhone className="text-cyan-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Số điện thoại
                      </p>
                      <p className="text-gray-800 dark:text-white">
                        {orderDetails.shippingInfo.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-cyan-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Địa chỉ giao hàng
                      </p>
                      <p className="text-gray-800 dark:text-white">
                        {orderDetails.shippingInfo.address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCreditCard className="text-cyan-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phương thức thanh toán
                      </p>
                      <p className="text-gray-800 dark:text-white">
                        {orderDetails.paymentMethod === "cod"
                          ? "Thanh toán khi nhận hàng (COD)"
                          : "Đã thanh toán qua " + orderDetails.paymentMethod}
                      </p>
                      <p
                        className={`text-sm ${
                          orderDetails.paymentStatus === "paid"
                            ? "text-green-500"
                            : orderDetails.paymentStatus === "pending"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {orderDetails.paymentStatus === "paid"
                          ? "Đã thanh toán"
                          : orderDetails.paymentStatus === "pending"
                          ? "Chờ thanh toán"
                          : "Thanh toán thất bại"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Sản phẩm
                </h2>
                <div className="space-y-4">
                  {orderDetails.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-4 border-b dark:border-gray-700 last:border-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-gray-800 dark:text-white font-medium">
                          {item.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Số lượng: {item.quantity}
                        </p>
                        <p className="text-cyan-600 font-medium">
                          {item.price.toLocaleString()}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tổng quan đơn hàng */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Tổng quan đơn hàng
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tạm tính</span>
                    <span>
                      {(orderDetails.items || [])
                        .reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                        .toLocaleString()}
                      đ
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Phí vận chuyển</span>
                    <span>50.000đ</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Giảm giá</span>
                    <span>-150.000đ</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold">
                    <span className="text-gray-800 dark:text-white">
                      Tổng cộng
                    </span>
                    <span className="text-cyan-600">
                      {orderDetails.total.toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
