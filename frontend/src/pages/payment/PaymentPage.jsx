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
import { useCartStore } from "../../store/Cart/useCartStore";
import useOrderStore from "../../store/Cart/useOrderStore";
import { toast } from "react-hot-toast";
import axios from "axios";

import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import { useAuthStore } from "@/store/authUser";

const PaymentPage = () => {
  const navigate = useNavigate();
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedAddress, setSelectedAddress] = useState("new");
  const [message, setMessage] = useState("");
  const { cartItems, selectedItems } = useCartStore();
  const { createOrderFromCart } = useOrderStore();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  // Lọc các sản phẩm đã chọn từ giỏ hàng
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));

  // Tính toán tổng tiền
  const orderSummary = {
    items: selectedCartItems,
    subtotal: selectedCartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0),
    shipping: 0,
    discount: 0,
    get total() {
      return this.subtotal + this.shipping - this.discount;
    }
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
  const handlePlaceOrder = async () => {
    if (selectedCartItems.length === 0) {
      toast.error("Vui lòng chọn sản phẩm để thanh toán!");
      return;
    }

    // Validate form nếu chọn địa chỉ mới
    if (deliveryMethod === "delivery" && selectedAddress === "new") {
      if (!formData.fullName || !formData.phone || !formData.address) {
        toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
        return;
      }
    }

    let orderData;
    try {
      // Chuẩn bị dữ liệu đơn hàng
      if(deliveryMethod === "delivery"){
        orderData = {
          cart_item_ids: selectedCartItems.map(item => item.id),
          recipient_name: formData.fullName,
          recipient_phone: formData.phone,
          recipient_address: formData.address,
          payment_type: paymentMethod,      // "cash" hoặc "payos"
          order_method: deliveryMethod,     // "delivery" hoặc "store_pickup"
          discount: orderSummary.discount,
          message: message
        }
      } else {
        orderData = {
          cart_item_ids: selectedCartItems.map(item => item.id),
          recipient_name: user.lastname + " " + user.firstname,
          recipient_phone: user.phone,
          recipient_address: "Đến trực tiếp cửa hàng",
          payment_type: paymentMethod,      // "cash" hoặc "payos"
          order_method: deliveryMethod,     // "delivery" hoặc "store_pickup"
          discount: orderSummary.discount,
          message: message
        }
      }
      
      console.log('Sending order data:', orderData);
      const response = await createOrderFromCart(orderData);
      console.log('Response:', response);

      if (response.success) {
        if (paymentMethod === 'payos') {
          try {
            // Tạo returnUrl với state được mã hóa
            const orderState = {
              orderDetails: {
                orderId: response.data.order_id,
                total: orderSummary.total,
                paymentMethod,
                items: selectedCartItems,
                shippingInfo: formData
              }
            };
            
            const stateParam = encodeURIComponent(JSON.stringify(orderState));
            const returnUrl = `${window.location.origin}/order-success?state=${stateParam}`;
            
            console.log('Creating payment with order ID:', response.data.order_id);
            
            const paymentResponse = await axios.post(
              `${import.meta.env.VITE_PHP_URL}/api/orders/${response.data.order_id}/payment`,
              {
                amount: orderSummary.total,
                orderInfo: `Thanh toán đơn hàng ${response.data.order_number}`,
                return_url: returnUrl,
                cancel_url: `${window.location.origin}/payment/cancel?orderCode=${response.data.order_id}`
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              }
            );

            console.log('Full payment request URL:', `${import.meta.env.VITE_PHP_URL}/api/orders/${response.data.order_id}/payment`);
            console.log('Payment request data:', {
              amount: orderSummary.total,
              orderInfo: `Thanh toán đơn hàng ${response.data.order_number}`,
              return_url: returnUrl,
              cancel_url: `${window.location.origin}/payment/cancel?orderCode=${response.data.order_id}`
            });
            console.log('Payment Response:', paymentResponse);

            if (paymentResponse.data.success && paymentResponse.data.paymentUrl) {
              window.location.href = paymentResponse.data.paymentUrl;
              return;
            } else {
              console.error('Payment response error:', paymentResponse.data);
              throw new Error(paymentResponse.data.message || 'Không thể tạo liên kết thanh toán');
            }
          } catch (error) {
            console.error('Payment creation error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            console.error('Error headers:', error.response?.headers);
            toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo thanh toán');
            return;
          }
        } else {
          // Nếu thanh toán tiền mặt, chuyển đến trang thành công
          toast.success('Đặt hàng thành công!');
          navigate("/order-success", {
            state: {
              orderDetails: {
                orderId: response.data.order_id,
                total: orderSummary.total,
                paymentMethod,
                items: selectedCartItems,
                shippingInfo: formData
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi đặt hàng');
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
                    value="cash"
                    checked={paymentMethod === "cash"}
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
                    value="payos"
                    checked={paymentMethod === "payos"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-cyan-600"
                  />
                  <FaCreditCard className="text-cyan-600 text-xl" />
                  <div>
                    <div className="text-gray-800 dark:text-white font-medium">
                      Thanh toán qua PayOS
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Thanh toán trực tuyến qua PayOS
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
                {selectedCartItems.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Chưa có sản phẩm nào được chọn
                  </div>
                ) : (
                  selectedCartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b dark:border-gray-700 last:border-0"
                    >
                      <img
                        src={item.product?.image_url || '/placeholder.jpg'}
                        alt={item.product?.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="text-gray-800 dark:text-white font-medium">
                          {item.product?.name}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Số lượng: {item.quantity}
                        </div>
                        <div className="text-cyan-600 font-medium">
                          {(item.product?.price * item.quantity).toLocaleString()}đ
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                disabled={selectedCartItems.length === 0}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  selectedCartItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-cyan-600 hover:bg-cyan-700"
                } text-white transition-colors`}
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
