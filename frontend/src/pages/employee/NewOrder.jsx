import React from "react";
import { v4 as uuidv4 } from 'uuid';
import {
  Search, PlusCircle, Trash2,
  SquareArrowLeft, X
} from "lucide-react";
import { useOrder } from "./hooks/useOrder";
import { useCustomer } from "./hooks/useCustomer";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const NewOrder = () => {
  const {
    products,
    selectedProducts,
    isSearchActive: isProductSearchActive,
    searchTerm: productSearchTerm,
    shippingFee,
    discount,
    paymentMethod,
    shippingMethod,
    staff,
    note,
    loading: orderLoading,
    error: orderError,
    totalProductPrice,
    finalTotal,
    setSearchTerm: setProductSearchTerm,
    setIsSearchActive: setIsProductSearchActive,
    setShippingFee,
    setDiscount,
    setPaymentMethod,
    setShippingMethod,
    setStaff,
    setNote,
    addProduct,
    updateProductQuantity,
    removeProduct,
    handleSearch: handleProductSearch,
    createOrder
  } = useOrder();

  const {
    customers,
    selectedCustomer,
    searchTerm: customerSearchTerm,
    isSearchActive: isCustomerSearchActive,
    loading: customerLoading,
    error: customerError,
    setSearchTerm: setCustomerSearchTerm,
    setIsSearchActive: setIsCustomerSearchActive,
    handleSearch: handleCustomerSearch,
    selectCustomer,
    clearSelectedCustomer
  } = useCustomer();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        if (!selectedCustomer?._id) {
            console.error('Missing customer ID:', selectedCustomer);
            throw new Error('Vui lòng chọn khách hàng');
        }

        if (!selectedProducts || selectedProducts.length === 0) {
            console.error('No products selected');
            throw new Error('Vui lòng chọn ít nhất một sản phẩm');
        }

        // Tạo mã đơn hàng với UUID
        const now = new Date();
        const uuid = uuidv4().split('-')[0]; // Lấy 8 ký tự đầu của UUID
        const orderNumber = `DH${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${uuid}`;

        // Log thông tin trước khi tạo đơn hàng
        console.log('Generated Order Number:', orderNumber);
        console.log('Selected customer:', selectedCustomer);
        console.log('Selected products:', selectedProducts);

        const orderData = {
            orderNumber,
            customerId: selectedCustomer._id,
            customerInfo: {
                name: selectedCustomer.name,
                phone: selectedCustomer.phone,
                email: selectedCustomer.email || '',
                address: selectedCustomer.address || ''
            },
            items: selectedProducts.map(product => ({
                productId: product._id,
                price: parseFloat(product.price),
                quantity: parseInt(product.quantity),
                total: parseFloat(product.price) * parseInt(product.quantity)
            })),
            totalAmount: parseFloat(totalProductPrice),
            discount: parseFloat(discount || 0),
            shippingFee: parseFloat(shippingFee || 0),
            finalTotal: parseFloat(finalTotal),
            paymentMethod,
            paymentStatus: (() => {
                // Nếu chọn "Đã thanh toán" hoặc các phương thức thanh toán trực tiếp
                if (
                    paymentMethod === "Tiền mặt" || 
                    paymentMethod === "Chuyển khoản" ||
                    paymentMethod === "Momo" ||
                    paymentMethod === "ZaloPay" ||
                    paymentMethod === "VNPay") {
                    return "paid";
                }
                // Nếu là thanh toán sau hoặc COD
                if (paymentMethod === "Thanh toán sau" || paymentMethod === "COD") {
                    return "pending";
                }
                return "unpaid";
            })(),
            shippingMethod,
            shippingStatus: (() => {
                switch (shippingMethod) {
                    case "Đã giao hàng":
                        return "delivered";
                    case "Đã qua hàng vận chuyển":
                        return "shipping";
                    case "Giao hàng sau":
                    default:
                        return "pending";
                }
            })(),
            note: note || '',
            staffId: staff,
            staffInfo: {
                name: staff,
                role: 'employee'
            },
            status: (() => {
                // Nếu đã giao hàng và đã thanh toán -> completed
                if (shippingMethod === "Đã giao hàng" && 
                    (paymentMethod === "Đã thanh toán" || 
                     paymentMethod === "Tiền mặt" || 
                     paymentMethod === "Chuyển khoản" ||
                     paymentMethod === "Momo" ||
                     paymentMethod === "ZaloPay" ||
                     paymentMethod === "VNPay")) {
                    return "completed";
                }
                // Nếu chỉ đã giao hàng -> delivered
                if (shippingMethod === "Đã giao hàng") {
                    return "delivered";
                }
                // Nếu đang giao hàng -> shipping
                if (shippingMethod === "Đã qua hàng vận chuyển") {
                    return "shipping";
                }
                // Mặc định -> pending
                return "pending";
            })()
        };

        console.log('Submitting order with data:', orderData);
        const response = await createOrder(orderData);
        console.log('Order creation successful:', response);

        // Hiển thị thông báo thành công
        toast.success('Tạo đơn hàng thành công!');
        
        // Reset form
        clearSelectedCustomer();

        // Chuyển hướng về trang danh sách đơn hàng
        navigate('/employee/orders');
    } catch (error) {
        console.error('Order submission error:', error);
        toast.error(error.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    }
};

  return (
    <div className="min-h-screen flex">
      <div className="ml-5 flex-1 flex flex-col">
        <div className="max-w-5xl mx-auto w-full">
          <div className="mt-15 flex items-center gap-4 mb-4">
            <button className="text-gray-600 hover:text-gray-900">
              <SquareArrowLeft />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold">Tạo đơn hàng</h1>
          </div>

          {(orderError || customerError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {orderError || customerError}
            </div>
          )}

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
                        value={productSearchTerm}
                        onChange={(e) => {
                          setProductSearchTerm(e.target.value);
                          handleProductSearch(e.target.value);
                        }}
                        onFocus={() => setIsProductSearchActive(true)}
                      />
                    </div>

                    {isProductSearchActive && (
                      <div 
                        className="absolute w-full bg-white shadow-lg border rounded-md mt-1 max-h-48 overflow-auto z-10"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {orderLoading ? (
                          <div className="p-2 text-center">Đang tải...</div>
                        ) : (
                          products
                            .filter((product) =>
                              product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
                            )
                            .map((product) => (
                              <div
                                key={product._id}
                                onClick={() => {
                                  addProduct(product, 1);
                                  setIsProductSearchActive(false);
                                  setProductSearchTerm('');
                                }}
                                className="w-full flex items-center gap-4 p-2 border-b hover:bg-gray-100 cursor-pointer"
                              >
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-md"
                                />
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-semibold">{product.name}</p>
                                  <p className="text-gray-600 text-xs">
                                    {product.price.toLocaleString()} đ
                                  </p>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Hiển thị sản phẩm đã chọn */}
                  <div className="mt-4 border-t pt-4 flex-1 flex flex-col">
                    <h3 className="font-semibold mb-2">Sản phẩm đã chọn:</h3>
                    {selectedProducts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center text-gray-500 flex-1">
                        <img src="/open-box.png" alt="No Product" className="w-16 sm:w-20 h-16 sm:h-20" />
                        <p className="mt-2 text-sm">Bạn chưa thêm sản phẩm nào</p>
                        <button className="text-blue-500 mt-2 flex items-center gap-1">
                          <PlusCircle size={18} />
                          Thêm sản phẩm
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto">
                        <ul className="space-y-2">
                          {selectedProducts.map((product) => (
                            <li
                              key={product.uniqueId}
                              className="flex items-center gap-4 p-2 border rounded-md"
                            >
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-10 sm:w-12 h-10 sm:h-12 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-semibold">{product.name}</p>
                                    <p className="text-gray-500 text-xs">SKU: {product.sku}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{(product.price * product.quantity).toLocaleString()} đ</p>
                                    <p className="text-gray-500 text-xs">{product.price.toLocaleString()} đ x {product.quantity}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => updateProductQuantity(product.uniqueId, product.quantity - 1)}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={product.quantity}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value);
                                    if (!isNaN(newQuantity)) {
                                      updateProductQuantity(product.uniqueId, newQuantity);
                                    }
                                  }}
                                  className="w-16 text-center border rounded-md"
                                />
                                <button
                                  onClick={() => updateProductQuantity(product.uniqueId, product.quantity + 1)}
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                  +
                                </button>
                                <button 
                                  onClick={() => removeProduct(product.uniqueId)} 
                                  className="text-red-500 hover:text-red-600 ml-2"
                                  title="Xóa sản phẩm"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Section - Thông tin đơn hàng */}
              <div className="space-y-6">
                {/* Khách hàng */}
                <div className="border p-4 rounded-md">
                  <h3 className="font-semibold text-lg">Khách hàng</h3>
                  <div className="relative">
                    <div className="flex items-center border p-2 rounded-md">
                      <Search className="text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên, SĐT... (F4)"
                        className="outline-none ml-2 w-full"
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          handleCustomerSearch(e.target.value);
                        }}
                        onFocus={() => setIsCustomerSearchActive(true)}
                        onBlur={() => setTimeout(() => setIsCustomerSearchActive(false), 200)}
                      />
                    </div>

                    {isCustomerSearchActive && (
                      <div className="absolute w-full bg-white shadow-lg border rounded-md mt-1 max-h-48 overflow-auto z-10">
                        {customerLoading ? (
                          <div className="p-2 text-center">Đang tải...</div>
                        ) : (
                          customers.map((customer) => (
                            <button
                              key={customer._id || customer.id}
                              onClick={() => selectCustomer(customer)}
                              className="w-full flex items-center gap-4 p-2 border-b hover:bg-gray-100"
                            >
                              <div className="flex-1 text-left">
                                <p className="text-sm font-semibold">{customer.name}</p>
                                <p className="text-gray-600 text-xs">{customer.phone}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {selectedCustomer && (
                      <div className="mt-2 p-2 border rounded-md flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{selectedCustomer.name}</p>
                          <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                        </div>
                        <button
                          onClick={clearSelectedCustomer}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Nhân viên phụ trách */}
                <div className="border p-4 rounded-md">
                  <h3 className="font-semibold text-lg">Thông tin đơn hàng</h3>
                  <select 
                    className="w-full p-2 border rounded-md mt-2"
                    value={staff}
                    onChange={(e) => setStaff(e.target.value)}
                    required
                  >
                    <option value="">Chọn nhân viên phụ trách *</option>
                    <option value="Nguyễn Văn A">Nguyễn Văn A</option>
                    <option value="Trần Thị B">Trần Thị B</option>
                    <option value="Lê Văn C">Lê Văn C</option>
                    <option value="Phạm Thị D">Phạm Thị D</option>
                  </select>
                </div>

                {/* Ghi chú */}
                <div className="border p-4 rounded-md">
                  <h3 className="font-semibold text-lg">Ghi chú</h3>
                  <textarea
                    placeholder="VD: Giao hàng trong giờ hành chính cho khách"
                    className="w-full p-2 border rounded-md mt-2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
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
                <label className="block font-medium mb-2">Phương thức thanh toán</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Chọn phương thức thanh toán *</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản ngân hàng</option>
                  <option value="Momo">Ví Momo</option>
                  <option value="ZaloPay">ZaloPay</option>
                  <option value="VNPay">VNPay</option>
                  <option value="COD">COD (Thu hộ)</option>
                </select>
              </div>
            </div>

            {/* Giao hàng */}
            {selectedProducts.length > 0 && (
              <div className="border p-4 rounded-md mt-6">
                <h3 className="font-semibold text-lg">Giao hàng</h3>
                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-2">
                  <label 
                    className={`flex items-center p-2 border rounded-md cursor-pointer w-full sm:w-auto transition-colors duration-200 ${
                      shippingMethod === "Nhận tại cửa hàng" 
                        ? "bg-blue-500 text-white border-blue-500" 
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="Nhận tại cửa hàng"
                      checked={shippingMethod === "Nhận tại cửa hàng"}
                      onChange={() => setShippingMethod("Nhận tại cửa hàng")}
                      className="hidden"
                    />
                    <span className={`w-5 h-5 border rounded-full mr-2 flex items-center justify-center ${
                      shippingMethod === "Nhận tại cửa hàng" ? "border-white" : "border-gray-400"
                    }`}>
                      {shippingMethod === "Nhận tại cửa hàng" && (
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span>Nhận tại cửa hàng</span>
                  </label>

                  <label 
                    className={`flex items-center p-2 border rounded-md cursor-pointer w-full sm:w-auto transition-colors duration-200 ${
                      shippingMethod === "Giao hàng sau" 
                        ? "bg-blue-500 text-white border-blue-500" 
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="Giao hàng sau"
                      checked={shippingMethod === "Giao hàng sau"}
                      onChange={() => setShippingMethod("Giao hàng sau")}
                      className="hidden"
                    />
                    <span className={`w-5 h-5 border rounded-full mr-2 flex items-center justify-center ${
                      shippingMethod === "Giao hàng sau" ? "border-white" : "border-gray-400"
                    }`}>
                      {shippingMethod === "Giao hàng sau" && (
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span>Giao hàng sau</span>
                  </label>

                  <label 
                    className={`flex items-center p-2 border rounded-md cursor-pointer w-full sm:w-auto transition-colors duration-200 ${
                      shippingMethod === "Giao cho bên vận chuyển" 
                        ? "bg-blue-500 text-white border-blue-500" 
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="Giao cho bên vận chuyển"
                      checked={shippingMethod === "Giao cho bên vận chuyển"}
                      onChange={() => setShippingMethod("Giao cho bên vận chuyển")}
                      className="hidden"
                    />
                    <span className={`w-5 h-5 border rounded-full mr-2 flex items-center justify-center ${
                      shippingMethod === "Giao cho bên vận chuyển" ? "border-white" : "border-gray-400"
                    }`}>
                      {shippingMethod === "Giao cho bên vận chuyển" && (
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                      )}
                    </span>
                    <span>Giao cho bên vận chuyển</span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
              <button className="bg-gray-300 px-4 py-2 rounded-md w-full sm:w-auto">
                Lưu nháp
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                onClick={handleSubmit}
                disabled={orderLoading}
              >
                {orderLoading ? 'Đang xử lý...' : 'Tạo đơn hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOrder; 