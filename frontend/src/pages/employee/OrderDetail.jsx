import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer, MoreHorizontal, CheckCircle2, Truck, CreditCard, XCircle } from 'lucide-react';
import orderService from './services/orderService';
import productService from './services/productService';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import useOrder from './hooks/useOrder';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { handleCancelOrder } = useOrder();

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
        return;
      }

      const product_ids = order.items.map(item => {
        let id;
      
        if (typeof item.product_id === 'object' && item.product_id !== null) {
          id = item.product_id._id || item.product_id.toString(); // Sửa ở đây
        } else {
          id = item.product_id;
        }
      
        return id;
      });
      
      const productPromises = product_ids.map(product_id => {
        if (!product_id) {
          console.error('Invalid product ID:', product_id);
          return Promise.resolve(null);
        }
        
        return productService.getProductById(product_id)
          .then(response => {
            if (response.success && response.product) {
              return [product_id, response.product];
            }
            console.error('Failed to get product details for:', product_id, response);
            return null;
          })
          .catch(error => {
            console.error('Error fetching product', product_id, ':', error);
            return null;
          });
      });

      const results = await Promise.all(productPromises);
      
      const details = {};
      results.forEach(result => {
        if (result) {
          const [product_id, product] = result;
          details[product_id] = product;
        }
      });

      setProductDetails(details);
    } catch (error) {
      console.error('Error in fetchProductDetails:', error);
      toast.error('Không thể tải thông tin chi tiết sản phẩm');
    }
  };

  const generateOrderHistory = (orderData) => {
    const history = [];
    const isInStorePickup = orderData.shipping_method === "Nhận tại cửa hàng";
    const defaultTimestamp = orderData.createdAt || orderData.created_at;

    // Thêm sự kiện tạo đơn
    history.push({
      type: 'created',
      title: 'Tạo đơn hàng',
      description: `Đơn hàng được tạo bởi ${orderData.staff_info?.name || 'Admin'}`,
      timestamp: defaultTimestamp,
      icon: CheckCircle2,
      color: 'blue'
    });

    // Thêm sự kiện đơn được xác nhận
    if (orderData.status === 'confirmed' || orderData.status === 'shipping' || orderData.status === 'completed') {
      history.push({
        type: 'confirmed',
        title: 'Đã xác nhận đơn',
        description: 'Đơn hàng đã được xác nhận',
        timestamp: orderData.confirmed_at || defaultTimestamp,
        icon: CheckCircle2,
        color: 'blue'
      });
    }

    // Thêm sự kiện thanh toán nếu đã thanh toán
    if (orderData.payment_status === 'paid') {
      history.push({
        type: 'payment',
        title: 'Thanh toán thành công',
        description: `Thanh toán qua ${orderData.payment_method}`,
        timestamp: orderData.payment_info?.paid_at || orderData.updated_at || orderData.updatedAt || defaultTimestamp,
        icon: CreditCard,
        color: 'green'
      });
    }

    // Chỉ thêm sự kiện vận chuyển và giao hàng nếu KHÔNG phải nhận tại cửa hàng
    if (!isInStorePickup) {
      // Thêm sự kiện vận chuyển
      if (orderData.shipping_status === 'shipping' || orderData.shipping_status === 'delivered') {
        history.push({
          type: 'shipping',
          title: 'Đang vận chuyển',
          description: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
          timestamp: orderData.shipping_updated_at || orderData.updated_at || orderData.updatedAt || defaultTimestamp,
          icon: Truck,
          color: 'orange'
        });
      }

      // Thêm sự kiện giao hàng thành công
      if (orderData.shipping_status === 'delivered') {
        history.push({
          type: 'delivered',
          title: 'Đã giao hàng',
          description: 'Đơn hàng đã được giao thành công',
          timestamp: orderData.delivered_at || orderData.updated_at || orderData.updatedAt || defaultTimestamp,
          icon: CheckCircle2,
          color: 'green'
        });
      }
    } else {
      // Nếu là nhận tại cửa hàng và đã hoàn thành hoặc đã thanh toán
      if (orderData.status === 'completed' || orderData.payment_status === 'paid') {
        history.push({
          type: 'completed',
          title: 'Đã nhận hàng',
          description: 'Khách hàng đã nhận hàng tại cửa hàng',
          timestamp: orderData.updated_at || orderData.updatedAt || defaultTimestamp,
          icon: CheckCircle2,
          color: 'green'
        });
      }
    }

    // Thêm sự kiện hủy đơn nếu có
    if (orderData.status === 'cancelled') {
      history.push({
        type: 'cancelled',
        title: 'Đã hủy đơn',
        description: orderData.cancel_reason || 'Đơn hàng đã bị hủy',
        timestamp: orderData.cancelled_at || orderData.updated_at || orderData.updatedAt || defaultTimestamp,
        icon: XCircle,
        color: 'red'
      });
    }

    // Sắp xếp theo thời gian, cũ nhất lên đầu
    history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    setOrderHistory(history);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN') + ' đ';
  };

  const handleUpdateShippingStatus = async () => {
    try {
      const orderId = order?._id || order?.id;
      
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }
      
      const currentTime = new Date().toISOString();
      
      // Tạo updateData đơn giản với format rõ ràng
      const updateData = {
        shipping_status: 'shipping',
        status: 'shipping',
        shipping_updated_at: currentTime,
        confirmed_at: order.confirmed_at || currentTime
      };

      const response = await orderService.updateOrder(orderId, updateData);
      
      if (response.success) {
        toast.success('Cập nhật trạng thái vận chuyển thành công');
        // Cập nhật lại dữ liệu đơn hàng từ response
        if (response.order) {
          setOrder(response.order);
        } else {
          // Tải lại dữ liệu nếu response không có order
          await fetchOrderDetails();
        }
      } else {
        throw new Error(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Error updating shipping status:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const handleConfirmOrder = async () => {
    try {
      const orderId = order?._id || order?.id;
      
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }
      
      const currentTime = new Date().toISOString();
      
      const updateData = {
        status: 'confirmed',
        confirmed_at: currentTime
      };

      const response = await orderService.updateOrder(orderId, updateData);
      
      if (response.success) {
        toast.success('Xác nhận đơn hàng thành công');
        if (response.order) {
          setOrder(response.order);
        } else {
          await fetchOrderDetails();
        }
      } else {
        throw new Error(response.message || 'Xác nhận đơn hàng thất bại');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      const orderId = order?._id || order?.id;
      
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }
      
      const currentTime = new Date().toISOString();
      const updateData = {
        status: 'completed',
        shipping_status: 'delivered',
        delivered_at: currentTime,
        shipping_updated_at: order.shipping_updated_at,
        confirmed_at: order.confirmed_at,
        cancelled_at: order.cancelled_at
      };

      const response = await orderService.updateOrder(orderId, updateData);

      if (response.success) {
        const updatedOrder = {
          ...order,
          ...updateData
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
              <p>Ngày tạo: ${formatDate(order.createdAt || order.created_at)}</p>
            </div>
          </div>

          <div class="order-info">
            <p><strong>Trạng thái:</strong> ${
              order.shipping_method === "Nhận tại cửa hàng"
                ? order.payment_status === "paid"
                  ? "Đã xử lý"
                  : order.status === 'completed'
                  ? 'Hoàn thành'
                  : order.status === 'cancelled'
                  ? 'Đã hủy'
                  : 'Chưa xử lý'
                : order.status === 'pending'
                ? "Chờ xử lý"
                : order.status === 'confirmed'
                ? "Đã xác nhận"
                : order.status === 'shipping'
                ? "Đang giao"
                : order.status === 'completed'
                ? "Hoàn thành"
                : order.status === 'cancelled'
                ? "Đã hủy"
                : order.status
            }</p>
            <p><strong>Phương thức thanh toán:</strong> ${order.payment_method}</p>
            <p><strong>Phương thức vận chuyển:</strong> ${order.shipping_method}</p>
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
                  // Xử lý product_id linh hoạt
                  let productId = typeof item.product_id === 'object' ? item.product_id._id || item.product_id.toString() : item.product_id;
                  
                  // Ép kiểu qua string
                  productId = String(productId);
                  
                  const productDetail = productDetails[productId];
                  
                  // Sử dụng tên từ item nếu có
                  const productName = productDetail?.name || item.name || item.product_name || 'Không tìm thấy thông tin sản phẩm';
                  
                  return `
                    <tr>
                      <td>${productName}</td>
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
            <p>Tổng tiền hàng: ${formatCurrency(order.total_amount)}</p>
            <p>Giảm giá: -${formatCurrency(order.discount)}</p>
            <p>Phí giao hàng: ${formatCurrency(order.shipping_fee)}</p>
            <h3>Thành tiền: ${formatCurrency(order.finaltotal)}</h3>
          </div>

          <div class="customer-info">
            <h2>Thông tin khách hàng</h2>
            <p><strong>Tên khách hàng:</strong> ${order.customer_info?.name}</p>
            <p><strong>Số điện thoại:</strong> ${order.customer_info?.phone}</p>
            <p><strong>Địa chỉ:</strong> ${order.customer_info?.address}</p>
          </div>

          <div class="footer">
            <p><strong>Nhân viên xử lý:</strong> ${order.staff_info?.name || 'Admin'}</p>
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
      const orderId = order?._id || order?.id;
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }

      const paymentResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/orders/${orderId}/payment`
      );
      window.location.href = paymentResponse.data.paymentUrl;
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error('Không thể tạo link thanh toán PayOS');
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const orderId = order?._id || order?.id;
      
      if (!orderId) {
        throw new Error('Không tìm thấy ID đơn hàng');
      }
      
      const currentTime = new Date().toISOString();
      const updateData = {
        payment_status: 'paid',
        status: order.shipping_status === 'delivered' ? 'completed' : order.status,
        payment_info: {
          ...order.payment_info,
          status: 'paid',
          paid_at: currentTime
        },
        shipping_updated_at: order.shipping_updated_at,
        confirmed_at: order.confirmed_at,
        delivered_at: order.delivered_at,
        cancelled_at: order.cancelled_at
      };

      const response = await orderService.updateOrder(orderId, updateData);

      if (response.success) {
        const updatedOrder = {
          ...order,
          payment_status: 'paid',
          status: order.shipping_status === 'delivered' ? 'completed' : order.status,
          payment_info: {
            ...order.payment_info,
            status: 'paid',
            paid_at: currentTime
          },
          shipping_updated_at: order.shipping_updated_at,
          confirmed_at: order.confirmed_at,
          delivered_at: order.delivered_at,
          cancelled_at: order.cancelled_at
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

  const handleCancelClick = async () => {
    try {
      if (!cancelReason.trim()) {
        toast.error('Vui lòng nhập lý do hủy đơn');
        return;
      }

      await handleCancelOrder(order._id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      
      // Kiểm tra route hiện tại để chuyển hướng đúng
      const isAdminRoute = location.pathname.startsWith('/admin');
      const routePrefix = isAdminRoute ? '/admin' : '/employee';
      navigate(`${routePrefix}/orders`);
    } catch (error) {
      // Toast error đã được xử lý trong handleCancelOrder
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
                onClick={() => {
                  const isAdminRoute = location.pathname.startsWith('/admin');
                  const routePrefix = isAdminRoute ? '/admin' : '/employee';
                  navigate(`${routePrefix}/orders`);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Đơn hàng #{order.order_number || order.orderNumber || 'Không có mã đơn hàng'}
                </h1>
                <p className="text-sm text-gray-500">
                Tạo lúc: {formatDate(order.createdAt || order.created_at)}
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
              {order.shipping_status !== 'shipping' && 
               order.shipping_status !== 'delivered' && 
               order.status !== 'completed' && 
               order.status !== 'cancelled' && (
                <button 
                  onClick={() => {
                    const isAdminRoute = location.pathname.startsWith('/admin');
                    const routePrefix = isAdminRoute ? '/admin' : '/employee';
                    navigate(`${routePrefix}/orders/${order._id}/edit`);
                  }}
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
                    order.shipping_method === "Nhận tại cửa hàng"
                      ? order.payment_status === "paid"
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
                    {order.shipping_method === "Nhận tại cửa hàng"
                      ? order.payment_status === "paid"
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
                  {/* Nút xác nhận đơn hàng chỉ hiển thị khi chưa được xác nhận */}
                  {order.status === 'pending' && 
                   order.status !== 'cancelled' && (
                    <button 
                      onClick={handleConfirmOrder}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
                    >
                      <CheckCircle2 size={20} />
                      <span>Xác nhận đơn</span>
                    </button>
                  )}

                  {/* Nút xác nhận giao hàng chỉ hiển thị khi đang giao */}
                  {order.shipping_method !== "Nhận tại cửa hàng" && 
                   order.shipping_status === 'shipping' && 
                   order.status !== 'completed' && 
                   order.status !== 'cancelled' && (
                    <button 
                      onClick={handleConfirmDelivery}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
                    >
                      <CheckCircle2 size={20} />
                      <span>Xác nhận đã giao</span>
                    </button>
                  )}

                  {/* Nút đẩy vận chuyển chỉ hiển thị khi đã xác nhận, chưa giao và chưa hủy */}
                  {order.shipping_method === "Giao cho bên vận chuyển" && 
                   order.status === 'confirmed' &&
                   order.shipping_status !== 'shipping' &&
                   order.shipping_status !== 'delivered' &&
                   order.status !== 'cancelled' && (
                    <button 
                      onClick={handleUpdateShippingStatus}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2"
                    >
                      <Truck size={20} />
                      <span>Đẩy vận chuyển</span>
                    </button>
                  )}

                  {/* Nút hủy đơn chỉ hiển thị khi chưa giao và chưa hoàn thành */}
                  {order.status !== 'cancelled' && 
                   order.status !== 'completed' &&
                   order.shipping_status !== 'shipping' && 
                   order.shipping_status !== 'delivered' && (
                    <button 
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2"
                    >
                      <XCircle size={20} />
                      <span>Hủy đơn</span>
                    </button>
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
                    // Try different ways to access product details
                    const productId = typeof item.product_id === 'object' ? item.product_id._id || item.product_id.toString() : item.product_id;
                    const productDetail = productDetails[productId];
                    
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
                  <span>{formatCurrency(order.total_amount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(order.discount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí giao hàng</span>
                  <span>{formatCurrency(order.shipping_fee || 0)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Thành tiền</span>
                  <span>{formatCurrency(order.finaltotal || 0)}</span>
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
                  <p className="font-medium">{order.payment_method}</p>
                </div>
                <div>
                  <p className="text-gray-600">Trạng thái thanh toán:</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      order.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : order.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {order.payment_status === 'paid' 
                        ? 'Đã thanh toán'
                        : order.payment_status === 'pending'
                        ? 'Đang chờ thanh toán'
                        : 'Chưa thanh toán'}
                    </span>
                    
                    {/* Hiển thị nút thanh toán lại cho PayOS */}
                    {order.payment_method.toLowerCase() === 'payos' && 
                     order.payment_status !== 'paid' && 
                     order.status !== 'cancelled' && (
                      <button
                        onClick={handleRepayment}
                        className="ml-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        Thanh toán lại
                      </button>
                    )}

                    {/* Hiển thị nút xác nhận thanh toán cho COD hoặc Cash */}
                    {(order.payment_method.toLowerCase() === 'cod' || 
                      (order.payment_method.toLowerCase() === 'cash' && !order.staff_info?.name)) && 
                     order.payment_status !== 'paid' && 
                     order.status !== 'cancelled' && (
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
                {order.payment_status === 'paid' && (
                  <>
                    <div>
                      <p className="text-gray-600">Mã giao dịch:</p>
                      <p className="font-medium">{order.transaction_id || order.payment_info?.transaction_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Thời gian thanh toán:</p>
                      <p className="font-medium">
                        {order.paid_at || order.payment_info?.paid_at 
                          ? formatDate(order.paid_at || order.payment_info?.paid_at)
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
                  {order.staff_info?.name ? order.staff_info.name.charAt(0) : 'A'}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{order.staff_info?.name || 'Admin'}</span>
                  <span className="text-sm text-gray-500">{order.staff_info?.role || 'Nhân viên'}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Khách hàng</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">{order.customer_info?.name}</p>
                  <p className="text-sm text-gray-500">
                    Tổng chi tiêu (1 đơn hàng): {formatCurrency(order.finaltotal || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nhóm khách hàng</p>
                  <p>Không áp dụng nhóm khách hàng</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Thông tin liên hệ</p>
                  <p>{order.customer_info?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ giao hàng</p>
                  <p>{order.customer_info?.address}</p>
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
                  <p>{order.staff_info?.name || 'Admin'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nhân viên phụ trách</p>
                  <p>{order.staff_info?.name || 'Admin'}</p>
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

      {/* Modal xác nhận hủy đơn */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hủy đơn
            </label>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn..."
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason('');
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelClick}
            >
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetail; 