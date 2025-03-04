import React, { useState } from "react";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import SidebarLeft from "../../components/SidebarLeft";
import SidebarRight from "../../components/SidebarRight";

const CartPage = () => {
  // State for quantity and total price
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(150000 + 40000); // Base price + shipping
  const unitPrice = 150000; // Price per item
  const shippingFee = 40000;

  // State for dark mode (toggle this in Header or wherever you have the switch)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Handlers for cart actions
  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
    setTotal((prev) => prev + unitPrice);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      setTotal((prev) => prev - unitPrice);
    }
  };

  const handleDelete = () => {
    alert("Sản phẩm đã được xóa khỏi giỏ hàng!");
  };

  const handleDiscount = () => {
    alert("Mã giảm giá đã được áp dụng (giả lập giảm 20,000đ)!");
    setTotal((prev) => prev - 20000);
  };

  const handleOrder = () => {
    alert(`Đặt hàng thành công! Tổng tiền: ${total.toLocaleString()}đ`);
  };

  return (
    <div className="bg-white text-black dark:bg-black dark:text-white p-4 h-auto">
      {/* Pass dark mode toggle to Header */}
      <Header toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />
      <Navbar />

      {/* Main layout with sidebars */}
      <div className="flex max-w-7xl mx-auto px-4 lg:px-8 gap-6">
        {/* SidebarLeft */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <SidebarLeft />
        </div>

        {/* Main Cart Content */}
        <div className="flex-1 max-w-3xl bg-white dark:bg-gray-800 shadow-lg p-6 rounded-xl my-8">
          {/* Thanh tiến trình */}
          <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4 mb-6">
            {["Giỏ hàng", "Thông tin đặt hàng", "Thanh toán", "Hoàn tất"].map(
              (step, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center ${
                    index === 0
                      ? "text-red-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full font-semibold ${
                      index === 0
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-sm mt-2 font-medium dark:text-gray-300">
                    {step}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Sản phẩm trong giỏ hàng */}
          <div className="flex items-center justify-between py-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <img
              src="https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Tai nghe"
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-1 px-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Tai nghe gì gì đó
              </h3>
            </div>
            <div className="text-right">
              <p className="text-red-500 font-semibold text-lg">150.000đ</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm line-through">
                200.000đ
              </p>
            </div>
          </div>

          {/* Nút xóa và số lượng */}
          <div className="flex justify-between items-center py-4">
            <button
              onClick={handleDelete}
              className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition flex items-center gap-1"
            >
              🗑 <span className="text-sm font-medium">Xóa</span>
            </button>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                onClick={handleDecrease}
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                -
              </button>
              <span className="px-4 py-1 text-gray-800 dark:text-gray-200 font-medium">
                {quantity}
              </span>
              <button
                onClick={handleIncrease}
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Mã giảm giá */}
          <button
            onClick={handleDiscount}
            className="border border-blue-500 p-2 w-full rounded-md flex items-center justify-center text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transition mt-4"
          >
            <span className="mr-2">🎟</span>
            <span className="font-medium">Sử dụng mã giảm giá</span>
          </button>

          {/* Thông tin tổng tiền */}
          <div className="mt-6 border-t dark:border-gray-700 pt-4">
            <div className="flex justify-between text-gray-600 dark:text-gray-400 text-sm">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-red-500 mt-3">
              <span>Tổng tiền:</span>
              <span>{total.toLocaleString()}đ</span>
            </div>
          </div>

          {/* Nút đặt hàng ngay */}
          <button
            onClick={handleOrder}
            className="w-full bg-red-500 text-white py-3 rounded-lg mt-6 text-lg font-semibold hover:bg-red-600 transition duration-300"
          >
            ĐẶT HÀNG NGAY
          </button>
        </div>

        {/* SidebarRight */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <SidebarRight />
        </div>
      </div>
    </div>
   
  );
};

export default CartPage;