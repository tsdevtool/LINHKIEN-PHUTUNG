import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaMinus,
  FaPlus,
  FaChevronRight,
  FaShoppingCart,
} from "react-icons/fa";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import EmptyCart from "../../components/cart/EmptyCart";
import { useCartStore } from "../../store/Cart/useCartStore";

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    getCart, 
    cartItems, 
    isLoading, 
    increaseQuantity, 
    decreaseQuantity 
  } = useCartStore();

  // Lấy dữ liệu giỏ hàng khi component mount
  useEffect(() => {
    getCart();
  }, []);

  // Tính tổng tiền
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product.price * item.quantity),
    0
  );
  const shipping = 50000;
  const discount = 0; // Tạm thời set 0
  const total = subtotal + shipping - discount;

  // Hàm xử lý xóa sản phẩm
  const handleRemoveItem = (id) => {
    // TODO: Implement remove item
    alert(`Đã xóa sản phẩm có id: ${id}`);
  };

  // Hàm xử lý thay đổi số lượng
  const handleQuantityChange = async (item, change) => {
    try {
      if (change > 0) {
        await increaseQuantity(item);
      } else {
        await decreaseQuantity(item);
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi số lượng:", error);
    }
  };

  // Hàm xử lý chuyển đến trang thanh toán
  const handleProceedToPayment = () => {
    navigate("/payment");
  };

  // Hiển thị loading khi đang tải dữ liệu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <Navbar />
        <div className="container mx-auto py-8 px-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
        </div>
      </div>
    );
  }

  // Hiển thị giỏ hàng trống nếu không có sản phẩm
  if (!cartItems || cartItems.length === 0) {
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
                  key={item._id || item.product_id}
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
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 sm:ml-4">
                    <h3 className="font-medium text-gray-800 dark:text-white mb-1">
                      {item.product.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-cyan-600 font-bold">
                        {item.product.price.toLocaleString()}đ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center mt-4 sm:mt-0">
                    <div className="flex items-center border dark:border-gray-600 rounded-md mr-6">
                      <button
                        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="px-3 py-1 border-x dark:border-gray-600 text-gray-800 dark:text-gray-200">
                        {item.quantity}
                      </span>
                      <button
                        className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleQuantityChange(item, 1)}
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
      </div>
    </div>
  );
};

export default CartPage;
