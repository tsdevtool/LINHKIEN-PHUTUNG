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
    decreaseQuantity,
    removeFromCart,
    selectedItems,
    setSelectedItems
  } = useCartStore();

  // Lấy dữ liệu giỏ hàng khi component mount
  useEffect(() => {
    getCart();
  }, []);

  // Xử lý chọn/bỏ chọn một sản phẩm
  const handleSelectItem = (cartItem) => {
    setSelectedItems(prev => {
      if (prev.includes(cartItem.id)) {
        return prev.filter(id => id !== cartItem.id);
      }
      return [...prev, cartItem.id];
    });
  };

  // Xử lý chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectedItems.length > 0) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  // Tính tổng tiền các sản phẩm được chọn
  const calculateSelectedTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const shipping = 50000;
  const discount = 0; // Tạm thời set 0
  const subtotal = calculateSelectedTotal();
  const total = subtotal + (selectedItems.length > 0 ? shipping : 0) - discount;

  // Hàm xử lý xóa sản phẩm
  const handleRemoveItem = async (item) => {
    try {
      if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        await removeFromCart(item.product_id);
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
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
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
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
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-cyan-600 cursor-pointer"
                    checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                    onChange={handleSelectAll}
                  />
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Chọn tất cả ({selectedItems.length}/{cartItems.length})
                  </h2>
                </div>
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
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-cyan-600 cursor-pointer"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item)}
                    />
                    <img
                      src={item.product?.image_url}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className="text-lg font-semibold mb-2 dark:text-white">
                      {item.product?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {item.product?.price?.toLocaleString('vi-VN')}đ
                    </p>
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
                        onClick={() => handleRemoveItem(item)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="text-right mt-4 sm:mt-0">
                    <p className="text-lg font-semibold dark:text-white">
                      {(item.quantity * item.product?.price)?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phần thanh toán - Bên phải */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/30 p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                Thanh toán ({selectedItems.length} sản phẩm)
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Phí vận chuyển</span>
                  <span>{selectedItems.length > 0 ? shipping.toLocaleString() : 0}đ</span>
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
                disabled={selectedItems.length === 0}
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-medium hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
