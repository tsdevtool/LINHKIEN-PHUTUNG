import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaTag,
  FaChevronRight,
  FaShoppingCart,
} from "react-icons/fa";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import EmptyCart from "../../components/cart/EmptyCart";
import RecommendedProducts from "../../components/cart/RecommendedProducts";

const CartPage = () => {
  const navigate = useNavigate();
  // State để kiểm tra giỏ hàng có trống không
  const [isEmpty, setIsEmpty] = useState(false);

  // Dữ liệu mẫu cho giỏ hàng
  const cartItems = [
    {
      id: 1,
      name: "CPU Intel Core i5-12400F",
      image: "https://picsum.photos/900/900",
      price: 4290000,
      originalPrice: 4790000,
      discount: 10,
      quantity: 1,
    },
    {
      id: 2,
      name: "RAM Kingston Fury Beast 16GB DDR4 3200MHz",
      image: "https://picsum.photos/900/900",
      price: 1290000,
      originalPrice: 1490000,
      discount: 13,
      quantity: 2,
    },
  ];

  // Dữ liệu mẫu cho voucher
  const vouchers = [
    {
      id: "TECH10",
      description: "Giảm 10% cho đơn hàng từ 2 triệu",
      discount: "10%",
      minOrder: 2000000,
    },
    {
      id: "FREESHIP",
      description: "Miễn phí vận chuyển cho đơn hàng từ 1 triệu",
      discount: "Miễn phí vận chuyển",
      minOrder: 1000000,
    },
  ];

  // Tính tổng tiền
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = 50000;
  const discount = 150000;
  const total = subtotal + shipping - discount;

  // Hàm xử lý xóa sản phẩm
  const handleRemoveItem = (id) => {
    // Trong thực tế, bạn sẽ cập nhật state thực sự
    alert(`Đã xóa sản phẩm có id: ${id}`);

    // Ví dụ về cách sử dụng setIsEmpty
    if (cartItems.length === 1) {
      setIsEmpty(true);
    }
  };

  // Hàm xử lý thay đổi số lượng
  const handleQuantityChange = (id, change) => {
    // Trong thực tế, bạn sẽ cập nhật state thực sự
    alert(
      `Đã thay đổi số lượng sản phẩm có id: ${id} (${
        change > 0 ? "tăng" : "giảm"
      })`
    );
  };

  // Hàm xử lý áp dụng voucher
  const handleApplyVoucher = (code) => {
    alert(`Đã áp dụng voucher: ${code}`);
  };

  // Hàm xử lý chuyển đến trang thanh toán
  const handleProceedToPayment = () => {
    navigate("/payment");
  };

  // Hiển thị giỏ hàng trống nếu không có sản phẩm
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <EmptyCart />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <FaShoppingCart className="text-2xl text-cyan-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Giỏ hàng của bạn
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Phần sản phẩm - Bên trái */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6 mb-6">
              <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Sản phẩm
                </h2>
                <span className="text-gray-500 dark:text-gray-400">
                  {cartItems.length} sản phẩm
                </span>
              </div>

              {/* Danh sách sản phẩm */}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center py-6 border-b dark:border-gray-700"
                >
                  <div className="flex items-center mb-4 sm:mb-0">
                    <input
                      type="checkbox"
                      className="mr-4 h-5 w-5 cursor-pointer accent-cyan-600"
                      defaultChecked
                    />
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 sm:ml-4">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs px-2 py-1 rounded">
                        -{item.discount}%
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-cyan-600 font-bold">
                        {item.price.toLocaleString()}đ
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        {item.originalPrice.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center mt-4 sm:mt-0">
                    <div className="flex items-center border dark:border-gray-600 rounded-md mr-6">
                      <button
                        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleQuantityChange(item.id, -1)}
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="px-3 py-1 border-x dark:border-gray-600 text-gray-800 dark:text-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleQuantityChange(item.id, 1)}
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Phần voucher */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Voucher
              </h2>

              <div className="flex items-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <FaTag className="text-cyan-600 mr-3" />
                <input
                  type="text"
                  placeholder="Nhập mã voucher"
                  className="flex-1 bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-400"
                />
                <button className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors">
                  Áp dụng
                </button>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2 text-gray-800 dark:text-white">
                  Voucher khả dụng
                </h3>
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="flex items-center justify-between border-b dark:border-gray-700 py-3"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-600 mr-3">
                        <FaTag />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white">
                          {voucher.id}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {voucher.description}
                        </div>
                      </div>
                    </div>
                    <button
                      className="text-cyan-600 hover:underline"
                      onClick={() => handleApplyVoucher(voucher.id)}
                    >
                      Áp dụng
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phần thanh toán - Bên phải */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Thanh toán
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span>{shipping.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Giảm giá</span>
                  <span>-{discount.toLocaleString()}đ</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-3 flex justify-between font-bold">
                  <span className="text-gray-800 dark:text-white">
                    Tổng cộng
                  </span>
                  <span className="text-cyan-600">
                    {total.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
              >
                Tiến hành thanh toán
                <FaChevronRight size={12} />
              </button>

              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Bằng cách nhấn &quot;Thanh toán ngay&quot;, bạn đồng ý với{" "}
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

        <RecommendedProducts />
      </div>
    </div>
  );
};

export default CartPage;
