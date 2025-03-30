import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, MoreHorizontal, CheckCircle2, Truck, CreditCard, XCircle } from 'lucide-react';
import orderService from './services/orderService';
import productService from './services/productService';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  useEffect(() => {
    if (order) {
      generateOrderHistory(order);
    }
  }, [order]);

  useEffect(() => {
    if (order && order.items && Array.isArray(order.items) && order.items.length > 0) {
      setProductsLoading(true);
      fetchProductDetails().finally(() => {
        setProductsLoading(false);
      });
    }
  }, [order]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      console.log('Order detail response:', response);
      
      if (response.success && response.order) {
        setOrder(response.order);
      } else {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError(error.message || 'Không thể tải thông tin đơn hàng');
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async () => {
    try {
      if (!order || !order.items || !Array.isArray(order.items)) {
        console.log('No items to fetch details for');
        return;
      }

      console.log('Starting to fetch product details');
      const productIds = order.items.map(item => item.productId);
      console.log('Product IDs to fetch:', productIds);
      
      // Fetch all products in parallel instead of sequential
      const productPromises = productIds.map(productId => 
        productService.getProductById(productId)
          .then(response => {
            console.log('Response for product', productId, ':', response);
            if (response.success && response.product) {
              return [productId, response.product];
            }
            console.error('Failed to get product details for:', productId, response);
            return null;
          })
          .catch(error => {
            console.error('Error fetching product', productId, ':', error);
            return null;
          })
      );

      const results = await Promise.all(productPromises);
      const details = {};
      
      results.forEach(result => {
        if (result) {
          const [productId, product] = result;
          details[productId] = product;
        }
      });

      console.log('Final product details:', details);
      setProductDetails(details);
    } catch (error) {
      console.error('Error in fetchProductDetails:', error);
      toast.error('Không thể tải thông tin chi tiết sản phẩm');
    }
  };

  const generateOrderHistory = (orderData) => {
    const history = [];

    // Thêm sự kiện tạo đơn
    history.push({
      type: 'created',
      title: 'Tạo đơn hàng',
      description: `Đơn hàng được tạo bởi ${orderData.staffInfo?.name || 'Admin'}`,
      timestamp: orderData.createdAt,
      icon: CheckCircle2,
      color: 'blue'
    });

    // Thêm sự kiện thanh toán nếu đã thanh toán
    if (orderData.paymentStatus === 'paid') {
      history.push({
        type: 'payment',
        title: 'Thanh toán thành công',
        description: `Thanh toán qua ${orderData.paymentMethod}`,
        timestamp: orderData.paymentInfo?.paidAt || orderData.updatedAt,
        icon: CreditCard,
        color: 'green'
      });
    }

    // Thêm sự kiện xác nhận đơn nếu đã xác nhận
    if (orderData.status === 'confirmed') {
      history.push({
        type: 'confirmed',
        title: 'Đã xác nhận đơn',
        description: 'Đơn hàng đã được xác nhận',
        timestamp: orderData.updatedAt,
        icon: CheckCircle2,
        color: 'blue'
      });
    }

    // Thêm sự kiện vận chuyển hoặc nhận tại cửa hàng
    if (orderData.shippingMethod === "Nhận tại cửa hàng") {
      if (orderData.paymentStatus === 'paid') {
        history.push({
          type: 'completed',
          title: 'Đã xử lý',
          description: 'Khách hàng đã nhận hàng tại cửa hàng',
          timestamp: orderData.updatedAt,
          icon: CheckCircle2,
          color: 'green'
        });
      }
    } else {
      // Thêm sự kiện đẩy vận chuyển (luôn giữ lại nếu đã có)
      if (orderData.shippingStatus === 'shipping' || orderData.shippingStatus === 'delivered') {
        history.push({
          type: 'shipping',
          title: 'Đang vận chuyển',
          description: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
          timestamp: orderData.shippingUpdatedAt || orderData.updatedAt, // Sử dụng thời gian cập nhật vận chuyển nếu có
          icon: Truck,
          color: 'orange'
        });
      }

      // Thêm sự kiện giao hàng thành công
      if (orderData.shippingStatus === 'delivered') {
        history.push({
          type: 'delivered',
          title: 'Đã giao hàng',
          description: 'Đơn hàng đã được giao thành công',
          timestamp: orderData.deliveredAt || orderData.updatedAt, // Sử dụng thời gian giao hàng nếu có
          icon: CheckCircle2,
          color: 'green'
        });
      }
    }

    // Thêm sự kiện hủy đơn nếu đơn bị hủy
    if (orderData.status === 'cancelled') {
      history.push({
        type: 'cancelled',
        title: 'Đơn hàng đã hủy',
        description: orderData.cancelReason || 'Không có lý do',
        timestamp: orderData.updatedAt,
        icon: XCircle,
        color: 'red'
      });
    }

    // Sắp xếp theo thời gian, cũ nhất lên đầu
    history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setOrderHistory(history);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN') + ' đ';
  };

  const handleUpdateShippingStatus = async () => {
    try {
      console.log('Updating shipping status for order:', order);
      const orderId = order?._id || order?.id;
      
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }
      
      const currentTime = new Date().toISOString();
      const response = await orderService.updateOrder(orderId, {
        ...order,
        shippingStatus: 'shipping',
        shippingUpdatedAt: currentTime,
        updatedAt: currentTime
      });

      console.log('Update response:', response);

      if (response.success) {
        const updatedOrder = {
          ...order,
          shippingStatus: 'shipping',
          shippingUpdatedAt: currentTime,
          updatedAt: currentTime
        };
        
        setOrder(updatedOrder);
        generateOrderHistory(updatedOrder);
        toast.success('Đã cập nhật trạng thái vận chuyển');
      } else {
        throw new Error(response.message || 'Không thể cập nhật trạng thái đơn hàng');
      }
    } catch (error) {
      console.error('Error updating shipping status:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái vận chuyển');
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      console.log('Confirming delivery for order:', order);
      const orderId = order?._id || order?.id;
      
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }
      
      const currentTime = new Date().toISOString();
      const response = await orderService.updateOrder(orderId, {
        ...order,
        shippingStatus: 'delivered',
        status: 'completed',
        deliveredAt: currentTime,
        updatedAt: currentTime
      });

      console.log('Update response:', response);

      if (response.success) {
        const updatedOrder = {
          ...order,
          shippingStatus: 'delivered',
          status: 'completed',
          deliveredAt: currentTime,
          updatedAt: currentTime
        };
        
        setOrder(updatedOrder);
        generateOrderHistory(updatedOrder);
        toast.success('Đã cập nhật trạng thái giao hàng thành công');
      } else {
        throw new Error(response.message || 'Không thể cập nhật trạng thái đơn hàng');
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái giao hàng');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Đơn hàng #${order.order_number || order.orderNumber}</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .logo {
              width: 120px;
              height: auto;
            }
            .order-info {
              margin-bottom: 20px;
            }
            .products table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .products th, .products td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .products th {
              background-color: #f8f9fa;
            }
            .totals {
              margin-top: 20px;
              text-align: right;
            }
            .customer-info {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/logo.png" alt="Logo" class="logo">
            <div>
              <h1>ĐƠN HÀNG #${order.order_number || order.orderNumber}</h1>
              <p>Ngày tạo: ${formatDate(order.createdAt)}</p>
            </div>
          </div>

          <div class="order-info">
            <p><strong>Trạng thái:</strong> ${
              order.shippingMethod === "Nhận tại cửa hàng"
                ? order.paymentStatus === "paid"
                  ? "Đã xử lý"
                  : order.status === 'completed'
                  ? 'Hoàn thành'
                  : order.status === 'cancelled'
                  ? 'Đã hủy'
                  : 'Chưa xử lý'
                : order.status === 'pending'
                ? "bg-yellow-50 text-yellow-800"
                : order.status === 'confirmed'
                ? "bg-blue-50 text-blue-800"
                : order.status === 'shipping'
                ? "bg-orange-50 text-orange-800"
                : order.status === 'completed'
                ? "bg-green-50 text-green-800"
                : order.status === 'cancelled'
                ? "bg-red-50 text-red-800"
                : "bg-gray-50 text-gray-800"
            }</p>
            <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
            <p><strong>Phương thức vận chuyển:</strong> ${order.shippingMethod}</p>
          </div>

          <div class="products">
            <h2>Sản phẩm</h2>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${order.items?.map(item => {
                  const productDetail = productDetails[item.productId];
                  return `
                    <tr>
                      <td>${productDetail?.name || 'Không tìm thấy thông tin sản phẩm'}</td>
                      <td>${item.quantity}</td>
                      <td>${formatCurrency(item.price)}</td>
                      <td>${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="totals">
            <p>Tổng tiền hàng: ${formatCurrency(order.totalAmount)}</p>
            <p>Giảm giá: -${formatCurrency(order.discount)}</p>
            <p>Phí giao hàng: ${formatCurrency(order.shippingFee)}</p>
            <h3>Thành tiền: ${formatCurrency(order.finalTotal)}</h3>
          </div>

          <div class="customer-info">
            <h2>Thông tin khách hàng</h2>
            <p><strong>Tên khách hàng:</strong> ${order.customerInfo?.name}</p>
            <p><strong>Số điện thoại:</strong> ${order.customerInfo?.phone}</p>
            <p><strong>Địa chỉ:</strong> ${order.customerInfo?.address}</p>
          </div>

          <div class="footer">
            <p><strong>Nhân viên xử lý:</strong> ${order.staffInfo?.name || 'Admin'}</p>
            <p><strong>Ghi chú:</strong> ${order.note || 'Không có'}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      toast.error('Không thể mở cửa sổ in');
    }
  };

  const handleRepayment = async () => {
    try {
      console.log('Creating payment link for order:', order);
      const orderId = order?._id || order?.id;
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }

      const paymentResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/orders/${orderId}/payment`
      );
      console.log('Payment link created:', paymentResponse.data);
      window.location.href = paymentResponse.data.paymentUrl;
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error('Không thể tạo link thanh toán PayOS');
    }
  };

  const handleConfirmPayment = async () => {
    try {
      console.log('Confirming payment for order:', order);
      const orderId = order?._id || order?.id;
      
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }
      
      const currentTime = new Date().toISOString();
      const response = await orderService.updateOrder(orderId, {
        ...order,
        paymentStatus: 'paid',
        status: order.shippingStatus === 'delivered' ? 'completed' : order.status,
        paymentInfo: {
          ...order.paymentInfo,
          status: 'paid',
          paidAt: currentTime
        },
        updatedAt: currentTime
      });

      console.log('Update response:', response);

      if (response.success) {
        const updatedOrder = {
          ...order,
          paymentStatus: 'paid',
          status: order.shippingStatus === 'delivered' ? 'completed' : order.status,
          paymentInfo: {
            ...order.paymentInfo,
            status: 'paid',
            paidAt: currentTime
          },
          updatedAt: currentTime
        };
        
        setOrder(updatedOrder);
        generateOrderHistory(updatedOrder);
        toast.success('Đã xác nhận thanh toán thành công');
      } else {
        throw new Error(response.message || 'Không thể cập nhật trạng thái thanh toán');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error(error.message || 'Không thể xác nhận thanh toán');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4">
        <div className="text-center py-10">
          <p className="text-gray-500">Không tìm thấy thông tin đơn hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/employee/orders')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Đơn hàng #{order.order_number || order.orderNumber || 'Không có mã đơn hàng'}
                </h1>
                <p className="text-sm text-gray-500">
                  Tạo lúc: {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer size={20} />
                <span>In đơn hàng</span>
              </button>
              {order.shippingStatus !== 'shipping' && 
               order.shippingStatus !== 'delivered' && 
               order.status !== 'completed' && 
               order.status !== 'cancelled' && (
                <button 
                  onClick={() => navigate(`/employee/orders/${order._id}/edit`)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                >
                  <span>Sửa đơn</span>
                </button>
              )}
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Trạng thái đơn hàng</h2>
              <div className="flex justify-between items-center">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.shippingMethod === "Nhận tại cửa hàng"
                      ? order.paymentStatus === "paid"
                        ? "bg-green-50 text-green-800"
                        : "bg-yellow-50 text-yellow-800"
                      : order.status === 'pending'
                      ? "bg-yellow-50 text-yellow-800"
                      : order.status === 'confirmed'
                      ? "bg-blue-50 text-blue-800"
                      : order.status === 'shipping'
                      ? "bg-orange-50 text-orange-800"
                      : order.status === 'completed'
                      ? "bg-green-50 text-green-800"
                      : order.status === 'cancelled'
                      ? "bg-red-50 text-red-800"
                      : "bg-gray-50 text-gray-800"
                  }`}>
                    {order.shippingMethod === "Nhận tại cửa hàng"
                      ? order.paymentStatus === "paid"
                        ? "Đã xử lý"
                        : "Chờ thanh toán"
                      : order.status === 'pending'
                      ? 'Chờ xử lý'
                      : order.status === 'confirmed'
                      ? 'Đã xác nhận'
                      : order.status === 'shipping'
                      ? 'Đang giao'
                      : order.status === 'completed'
                      ? 'Hoàn thành'
                      : order.status === 'cancelled'
                      ? 'Đã hủy'
                      : order.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {order.shippingMethod !== "Nhận tại cửa hàng" && order.shippingStatus !== 'delivered' && (
                    <>
                      <button 
                        onClick={handleConfirmDelivery}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                      >
                        <CheckCircle2 size={20} />
                        <span>Xác nhận giao hàng</span>
                      </button>
                      {order.shippingMethod === "Giao cho bên vận chuyển" && order.shippingStatus !== 'shipping' && (
                        <button 
                          onClick={handleUpdateShippingStatus}
                          className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Truck size={20} />
                          <span>Đẩy vận chuyển</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
              <div className="space-y-4">
                {productsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Đang tải thông tin sản phẩm...</p>
                  </div>
                ) : (
                  order.items?.map((item, index) => {
                    const productDetail = productDetails[item.productId];
                    return (
                      <div key={index} className="flex items-center gap-4 py-4 border-b last:border-0">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={productDetail?.image_url || 'https://placehold.co/64x64?text=No+Image'}
                            alt={productDetail?.name || 'Sản phẩm'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/64x64?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">
                            {productDetail?.name || 'Không tìm thấy thông tin sản phẩm'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {productDetail?.category?.name && (
                              <span className="text-blue-500">{productDetail.category.name}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(item.price)}</p>
                          <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tổng tiền hàng</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí giao hàng</span>
                  <span>{formatCurrency(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Thành tiền</span>
                  <span>{formatCurrency(order.finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h2>
              <div className="space-y-6">
                {orderHistory.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <div key={index} className="flex gap-4">
                      <div className={`relative flex items-center justify-center`}>
                        <div className={`w-8 h-8 rounded-full bg-${event.color}-100 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 text-${event.color}-500`} />
                        </div>
                        {index !== orderHistory.length - 1 && (
                          <div className="absolute w-0.5 bg-gray-200 h-full top-8 left-4 -translate-x-1/2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.description}</p>
                        <p className="text-sm text-gray-400 mt-1">{formatDate(event.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Status Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Thông tin thanh toán</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Phương thức thanh toán:</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-gray-600">Trạng thái thanh toán:</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : order.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.paymentStatus === 'paid' 
                        ? 'Đã thanh toán'
                        : order.paymentStatus === 'pending'
                        ? 'Chờ thanh toán'
                        : 'Chưa thanh toán'}
                    </span>
                    
                    {/* Hiển thị nút thanh toán lại cho PayOS */}
                    {order.paymentMethod.toLowerCase() === 'payos' && 
                     order.paymentStatus !== 'paid' && (
                      <button
                        onClick={handleRepayment}
                        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        Thanh toán lại
                      </button>
                    )}

                    {/* Hiển thị nút xác nhận thanh toán cho COD */}
                    {order.paymentMethod.toLowerCase() === 'cod' && 
                     order.paymentStatus !== 'paid' && (
                      <button
                        onClick={handleConfirmPayment}
                        className="ml-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm flex items-center gap-1"
                      >
                        <CheckCircle2 size={16} />
                        Xác nhận thanh toán
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Hiển thị thông tin thanh toán PayOS nếu có */}
                {order.paymentStatus === 'paid' && (
                  <>
                    <div>
                      <p className="text-gray-600">Mã giao dịch:</p>
                      <p className="font-medium">{order.transactionId || order.paymentInfo?.transactionId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Thời gian thanh toán:</p>
                      <p className="font-medium">
                        {order.paidAt || order.paymentInfo?.paidAt 
                          ? formatDate(order.paidAt || order.paymentInfo?.paidAt)
                          : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Source */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Nguồn đơn</h2>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {order.staffInfo?.name ? order.staffInfo.name.charAt(0) : 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{order.staffInfo?.name || 'Admin'}</span>
                  <span className="text-sm text-gray-500">{order.staffInfo?.role || 'Nhân viên'}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Khách hàng</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{order.customerInfo?.name}</p>
                  <p className="text-sm text-gray-500">
                    Tổng chi tiêu (1 đơn hàng): {formatCurrency(order.finalTotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nhóm khách hàng</p>
                  <p>Không áp dụng nhóm khách hàng</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Thông tin liên hệ</p>
                  <p>{order.customerInfo?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ giao hàng</p>
                  <p>{order.customerInfo?.address}</p>
                  <p>Vietnam</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Thông tin bổ sung</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nhân viên tạo đơn</p>
                  <p>{order.staffInfo?.name || 'Admin'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nhân viên phụ trách</p>
                  <p>{order.staffInfo?.name || 'Admin'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                  <p>{order.note || 'Chưa có ghi chú'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 