import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTruck,
  FaStore,
  FaCreditCard,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUser,
  FaChevronRight,
  FaShoppingCart,
} from "react-icons/fa";

import Header from "../../components/Header";
import Navbar from "../../components/Navbar";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [selectedAddress, setSelectedAddress] = useState("new");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  // Dữ liệu mẫu cho địa chỉ đã lưu
  const savedAddresses = [
    {
      id: "saved-1",
      name: "Nguyễn Văn A",
      phone: "0123456789",
      address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    },
    {
      id: "saved-2",
      name: "Nguyễn Văn B",
      phone: "0987654321",
      address: "456 Đường DEF, Phường UVW, Quận 2, TP.HCM",
    },
  ];

  // Dữ liệu mẫu đơn hàng
  const orderSummary = {
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
    subtotal: 6870000,
    shipping: 50000,
    discount: 150000,
    total: 6770000,
  };

  // Xử lý thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = () => {
    // Validate form nếu chọn địa chỉ mới
    if (deliveryMethod === "delivery" && selectedAddress === "new") {
      if (!formData.fullName || !formData.phone || !formData.address) {
        alert("Vui lòng điền đầy đủ thông tin giao hàng!");
        return;
      }
    }

    // Xử lý đặt hàng dựa trên phương thức thanh toán
    switch (paymentMethod) {
      case "cod":
        alert("Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.");
        navigate("/order-success");
        break;
      case "bank":
        window.location.href = "https://bank-payment-gateway.com";
        break;
      case "momo":
        window.location.href = "https://momo-payment.com";
        break;
      case "vnpay":
        window.location.href = "https://vnpay-payment.com";
        break;
      case "zalopay":
        window.location.href = "https://zalopay-payment.com";
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        {/* Tiêu đề trang */}
        <div className="flex items-center gap-3 mb-6">
          <FaShoppingCart className="text-2xl text-cyan-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Thanh toán
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Phần thông tin - Bên trái */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Phương thức giao hàng */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Phương thức giao hàng
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:border-cyan-600 transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked={deliveryMethod === "delivery"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="accent-cyan-600"
                  />
                  <FaTruck className="text-cyan-600 text-xl" />
                  <div>
                    <div className="text-gray-800 dark:text-white font-medium">
                      Giao hàng tận nơi
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Nhận hàng trong 2-3 ngày làm việc
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:border-cyan-600 transition-colors">
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={deliveryMethod === "pickup"}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="accent-cyan-600"
                  />
                  <FaStore className="text-cyan-600 text-xl" />
                  <div>
                    <div className="text-gray-800 dark:text-white font-medium">
                      Đặt trước và lấy hàng tại cửa hàng
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Lấy hàng trong giờ làm việc
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Thông tin giao hàng - Chỉ hiển thị khi chọn giao hàng tận nơi */}
            {deliveryMethod === "delivery" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Thông tin giao hàng
                </h2>
                <div className="space-y-4">
                  <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="w-full p-3 border dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white outline-none focus:border-cyan-600"
                  >
                    <option value="new">+ Thêm địa chỉ mới</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name} - {addr.phone} - {addr.address}
                      </option>
                    ))}
                  </select>

                  {selectedAddress === "new" && (
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleFormChange}
                          placeholder="Họ và tên"
                          className="w-full pl-10 p-3 border dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white outline-none focus:border-cyan-600"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhoneAlt className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleFormChange}
                          placeholder="Số điện thoại"
                          className="w-full pl-10 p-3 border dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white outline-none focus:border-cyan-600"
                        />
                      </div>

                      <div className="relative">
                        <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                          <FaMapMarkerAlt className="text-gray-400" />
                        </div>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleFormChange}
                          placeholder="Địa chỉ giao hàng"
                          rows="3"
                          className="w-full pl-10 p-3 border dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white outline-none focus:border-cyan-600"
                        ></textarea>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thông báo đặt trước - Chỉ hiển thị khi chọn đặt trước */}
            {deliveryMethod === "pickup" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-lg">
                  <h3 className="font-medium mb-2">Thông tin quan trọng</h3>
                  <p>
                    Đơn hàng của bạn sẽ được tạm giữ trong 2 ngày. Vui lòng đến
                    cửa hàng để nhận hàng và thanh toán trong thời gian này.
                  </p>
                  <p className="mt-2 font-medium">
                    Địa chỉ: 123 Đường XYZ, Phường ABC, Quận 1, TP.HCM
                  </p>
                  <p className="font-medium">
                    Thời gian: 8:00 - 21:00 (Thứ 2 - Chủ nhật)
                  </p>
                </div>
              </div>
            )}

            {/* Phương thức thanh toán */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:border-cyan-600 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-cyan-600"
                  />
                  <FaMoneyBillWave className="text-cyan-600 text-xl" />
                  <div>
                    <div className="text-gray-800 dark:text-white font-medium">
                      Thanh toán khi nhận hàng
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Thanh toán bằng tiền mặt khi nhận hàng
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:border-cyan-600 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-cyan-600"
                  />
                  <FaCreditCard className="text-cyan-600 text-xl" />
                  <div>
                    <div className="text-gray-800 dark:text-white font-medium">
                      Chuyển khoản ngân hàng
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Hỗ trợ tất cả ngân hàng nội địa
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:border-cyan-600 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === "momo"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-cyan-600"
                  />
                  {/* <SiMomo className="text-[#A50064] text-2xl" /> */}
                  <div>
                    <div className="text-gray-800 dark:text-white font-medium">
                      Ví MoMo
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Thanh toán qua ví điện tử MoMo
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:border-cyan-600 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === "vnpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-cyan-600"
                  />
                  <img src="/vnpay-logo.png" alt="VNPay" className="w-8 h-8" />
                  <div>
                    <div className="text-gray-800 dark:text-white font-medium">
                      VNPay
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Thanh toán qua cổng VNPay
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:border-cyan-600 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="zalopay"
                    checked={paymentMethod === "zalopay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-cyan-600"
                  />
                  {/* <SiZalo className="text-[#0068FF] text-2xl" /> */}
                  <div>
                    <div className="text-gray-800 dark:text-white font-medium">
                      ZaloPay
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Thanh toán qua ví điện tử ZaloPay
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Lời nhắn */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Lời nhắn
              </h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Để lại lời nhắn cho đơn hàng của bạn..."
                rows="3"
                className="w-full p-3 border dark:border-gray-700 rounded-lg bg-transparent text-gray-800 dark:text-white outline-none focus:border-cyan-600"
              ></textarea>
            </div>
          </div>

          {/* Phần tổng quan đơn hàng - Bên phải */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Tổng quan đơn hàng
              </h2>

              {/* Danh sách sản phẩm */}
              <div className="space-y-4 mb-6">
                {orderSummary.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b dark:border-gray-700 last:border-0"
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
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Số lượng: {item.quantity}
                      </div>
                      <div className="text-cyan-600 font-medium">
                        {(item.price * item.quantity).toLocaleString()}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tổng tiền */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span>{orderSummary.subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span>{orderSummary.shipping.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Giảm giá</span>
                  <span>-{orderSummary.discount.toLocaleString()}đ</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold">
                  <span className="text-gray-800 dark:text-white">
                    Tổng cộng
                  </span>
                  <span className="text-cyan-600">
                    {orderSummary.total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              {/* Nút đặt hàng */}
              <button
                onClick={handlePlaceOrder}
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
              >
                Đặt hàng ngay
                <FaChevronRight size={12} />
              </button>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Bằng cách nhấn &quot;Đặt hàng ngay&quot;, bạn đồng ý với{" "}
                <a href="#" className="text-cyan-600 hover:underline">
                  Điều khoản dịch vụ
                </a>{" "}
                và{" "}
                <a href="#" className="text-cyan-600 hover:underline">
                  Chính sách bảo mật
                </a>{" "}
                của chúng tôi.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
