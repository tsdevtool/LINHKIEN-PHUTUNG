import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, MoreHorizontal } from 'lucide-react';
import orderService from './services/orderService';
import { toast } from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

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
                  {order.orderNumber || 'Không có mã đơn hàng'}
                </h1>
                <p className="text-sm text-gray-500">
                  Tạo lúc: {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2">
                <Printer size={20} />
                <span>In đơn hàng</span>
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                Sửa đơn
              </button>
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
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-800">
                    {order.status === 'pending' ? 'Chưa xử lý' :
                     order.status === 'completed' ? 'Hoàn thành' :
                     order.status === 'cancelled' ? 'Đã hủy' : order.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Xác nhận giao hàng
                  </button>
                  <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                    Đẩy vận chuyển
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 py-4 border-b last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={item.imageUrl || 'https://placehold.co/64x64?text=No+Image'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load for product:', item.name);
                          e.target.src = 'https://placehold.co/64x64?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">ID: {item.productId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                ))}
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
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <p className="font-medium">Tạo đơn hàng</p>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
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
                  A
                </div>
                <span>Admin</span>
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