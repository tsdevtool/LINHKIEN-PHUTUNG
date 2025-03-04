import React, { useState } from "react";
import {
  Search, PlusCircle, Trash2,

  SquareArrowLeft
} from "lucide-react";
import Header from "./Header";

// Danh sách sản phẩm test có hình ảnh
const sampleProducts = [
  { id: 1, name: "Bi cầu red magic 2.0", price: 200000, image: "/bicau.jpg" },
  { id: 2, name: "Phuộc nitron winner X", price: 150000, image: "/nitron.jpg" },
  { id: 3, name: "Phuộc rcb winner X", price: 180000, image: "/rcb.jpg" },
  { id: 4, name: "Phuộc rcb 2 winner X", price: 170000, image: "/rcb2.jpg" },
];

const NewOrder = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Hình thức thanh toán");
  const [shippingMethod, setShippingMethod] = useState("Giao hàng sau");

  const addProduct = (product) => {
    setSelectedProducts((prev) => [...prev, product]);
    setIsSearchActive(false);
  };

  const removeProduct = (index) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const totalProductPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0);
  const finalTotal = totalProductPrice - discount + shippingFee;

  return (
    <div className="min-h-screen flex">
      {/* Main Content (bao gồm Header và nội dung chính) */}
      <div className="ml-5 flex-1 flex flex-col">
        {/* Sticky Header (chỉ chiếm một phần nhỏ ở trên cùng của nội dung chính) */}
        <div className="fixed top-0 left-64 right-0 bg-white shadow-md z-50 h-14">
          <Header />
        </div>

        {/* Nội dung chính với padding cho header */}
        <div className="max-w-5xl mx-auto w-full">
    <div className="mt-15 flex items-center gap-4 mb-4">
      <button className="text-gray-600 hover:text-gray-900"><SquareArrowLeft /></button>
      <h1 className="text-xl sm:text-2xl font-bold">Tạo đơn hàng</h1>
    </div>


          {/* Main Content */}
          <div className="bg-white p-4 sm:p-6 shadow-lg rounded-lg w-full max-w-5xl mx-auto flex-grow">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Section - Sản phẩm */}
              <div className="lg:col-span-2 flex flex-col space-y-6">
                <div className="border p-4 rounded-md flex flex-col min-h-[300px] sm:min-h-[400px]">
                  <label className="block text-gray-700 font-semibold mb-2">Sản phẩm</label>

                  {/* Tìm kiếm sản phẩm */}
                  <div className="relative">
                    <div className="flex items-center border p-2 rounded-md">
                      <Search className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên, mã SKU... (F3)"
                        className="outline-none ml-2 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsSearchActive(true)}
                        onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
                      />
                    </div>

                    {isSearchActive && (
                      <div className="absolute w-full bg-white shadow-lg border rounded-md mt-1 max-h-48 overflow-auto z-10">
                        {sampleProducts
                          .filter((product) =>
                            product.name.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((product) => (
                            <button
                              key={product.id}
                              onClick={() => addProduct(product)}
                              className="w-full flex items-center gap-4 p-2 border-b hover:bg-gray-100"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded-md"
                              />
                              <div className="flex-1 text-left">
                                <p className="text-sm font-semibold">{product.name}</p>
                                <p className="text-gray-600 text-xs">
                                  {product.price.toLocaleString()} đ
                                </p>
                              </div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Hiển thị sản phẩm đã chọn */}
                  <div className="mt-4 border-t pt-4 flex-1">
                    <h3 className="font-semibold">Sản phẩm đã chọn:</h3>
                    {selectedProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-gray-500 h-full">
                        <img src="/open-box.png" alt="No Product" className="w-16 sm:w-20 h-16 sm:h-20" />
                        <p className="mt-2 text-sm">Bạn chưa thêm sản phẩm nào</p>
                        <button className="text-blue-500 mt-2 flex items-center gap-1">
                          <PlusCircle size={18} />
                          Thêm sản phẩm
                        </button>
                      </div>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {selectedProducts.map((product, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-4 p-2 border rounded-md"
                          >
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 sm:w-12 h-10 sm:h-12 object-cover rounded-md"
                            />
                            <div className="flex-1 text-left">
                              <p className="text-sm font-semibold">{product.name}</p>
                              <p className="text-gray-600 text-xs">
                                {product.price.toLocaleString()} đ
                              </p>
                            </div>
                            <button onClick={() => removeProduct(index)} className="text-red-500">
                              <Trash2 size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section - Thông tin đơn hàng */}
              <div className="space-y-6">
                {/* Khách hàng */}
                <div className="border p-4 rounded-md">
                  <h3 className="font-semibold text-lg">Khách hàng</h3>
                  <div className="flex items-center border p-2 rounded-md">
                    <Search className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên, SĐT... (F4)"
                      className="outline-none ml-2 w-full"
                    />
                  </div>
                </div>

                {/* Nhân viên phụ trách */}
                <div className="border p-4 rounded-md">
                  <h3 className="font-semibold text-lg">Thông tin đơn hàng</h3>
                  <select className="w-full p-2 border rounded-md mt-2">
                    <option>Chọn nhân viên</option>
                    <option>Nguyễn Văn A</option>
                    <option>Trần Thị B</option>
                  </select>
                </div>

                {/* Ghi chú */}
                <div className="border p-4 rounded-md">
                  <h3 className="font-semibold text-lg">Ghi chú</h3>
                  <textarea
                    placeholder="VD: Giao hàng trong giờ hành chính cho khách"
                    className="w-full p-2 border rounded-md mt-2"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="border p-4 rounded-md mt-6">
              <h3 className="font-semibold text-lg">Thanh toán</h3>
              <div className="mt-2 space-y-2">
                <p className="flex justify-between">
                  <span>Tổng tiền hàng</span>
                  <span>{totalProductPrice.toLocaleString()} đ</span>
                </p>
                <p className="flex justify-between">
                  <span>Thêm giảm giá (F6)</span>
                  <span>{discount.toLocaleString()} đ</span>
                </p>
                <p className="flex justify-between">
                  <span>Thêm phí giao hàng (F7)</span>
                  <span>{shippingFee.toLocaleString()} đ</span>
                </p>
                <p className="flex justify-between font-bold">
                  <span>Thành tiền</span>
                  <span>{finalTotal.toLocaleString()} đ</span>
                </p>
              </div>
              <div className="mt-4 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Đã thanh toán"
                    checked={paymentMethod === "Đã thanh toán"}
                    onChange={() => setPaymentMethod("Đã thanh toán")}
                  />
                  <span className="ml-2">Đã thanh toán</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Thanh toán sau"
                    checked={paymentMethod === "Thanh toán sau"}
                    onChange={() => setPaymentMethod("Thanh toán sau")}
                  />
                  <span className="ml-2">Thanh toán sau</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Hình thức thanh toán"
                    checked={paymentMethod === "Hình thức thanh toán"}
                    onChange={() => setPaymentMethod("Hình thức thanh toán")}
                  />
                  <span className="ml-2">Hình thức thanh toán</span>
                </label>
                <select
                  className="w-full p-2 border rounded-md mt-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={paymentMethod !== "Hình thức thanh toán"}
                >
                  <option value="Hình thức thanh toán">Tiền mặt</option>
                </select>
              </div>
            </div>

            {/* Giao hàng */}
            {selectedProducts.length > 0 && (
              <div className="border p-4 rounded-md mt-6">
                <h3 className="font-semibold text-lg">Giao hàng</h3>
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                  <label className="flex items-center p-2 border rounded-md cursor-pointer w-full sm:w-auto">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="Đã qua hàng vận chuyển"
                      checked={shippingMethod === "Đã qua hàng vận chuyển"}
                      onChange={() => setShippingMethod("Đã qua hàng vận chuyển")}
                      className="hidden"
                    />
                    <span className="w-5 h-5 border rounded-full mr-2 flex items-center justify-center">
                      {shippingMethod === "Đã qua hàng vận chuyển" && (
                        <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                      )}
                    </span>
                    <span className="text-gray-600">Đã qua hàng vận chuyển</span>
                  </label>
                  <label className="flex items-center p-2 border rounded-md cursor-pointer w-full sm:w-auto">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="Đã giao hàng"
                      checked={shippingMethod === "Đã giao hàng"}
                      onChange={() => setShippingMethod("Đã giao hàng")}
                      className="hidden"
                    />
                    <span className="w-5 h-5 border rounded-full mr-2 flex items-center justify-center">
                      {shippingMethod === "Đã giao hàng" && (
                        <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                      )}
                    </span>
                    <span className="text-gray-600">Đã giao hàng</span>
                  </label>
                  <label className="flex items-center p-2 border rounded-md bg-blue-500 text-white cursor-pointer w-full sm:w-auto">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="Giao hàng sau"
                      checked={shippingMethod === "Giao hàng sau"}
                      onChange={() => setShippingMethod("Giao hàng sau")}
                      className="hidden"
                    />
                    <span className="w-5 h-5 border rounded-full mr-2 flex items-center justify-center">
                      {shippingMethod === "Giao hàng sau" && (
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span className="text-white">Giao hàng sau</span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
              <button className="bg-gray-300 px-4 py-2 rounded-md w-full sm:w-auto">
                Lưu nháp
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded-md w-full sm:w-auto">
                Tạo đơn hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder;