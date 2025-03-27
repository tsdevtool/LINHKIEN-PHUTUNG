import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Filter } from 'lucide-react';
import orderService from './services/orderService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrders();
      console.log('Raw API Response:', response);

      // Kiểm tra và xử lý dữ liệu
      let ordersData = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response?.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else if (response?.data && Array.isArray(response.data)) {
        ordersData = response.data;
      }

      // Validate và chuẩn hóa dữ liệu đơn hàng theo cấu trúc server
      ordersData = ordersData.map(order => {
        console.log('Processing order:', order);
        // Parse customerInfo từ string nếu cần
        let customerInfo = order.customerInfo;
        if (typeof customerInfo === 'string') {
          try {
            customerInfo = JSON.parse(customerInfo);
          } catch (e) {
            console.warn('Error parsing customerInfo:', e);
            customerInfo = { name: 'Không có tên', phone: 'Không có SĐT' };
          }
        }

        const processedOrder = {
          _id: order._id || order.id, // Thử lấy id từ cả hai trường
          order_number: order.order_number || order.orderNumber, // Sử dụng cả hai trường
          customerInfo: {
            name: customerInfo?.name || 'Không có tên',
            phone: customerInfo?.phone || 'Không có SĐT',
            address: customerInfo?.address || 'Không có địa chỉ'
          },
          items: Array.isArray(order.items) ? order.items : [],
          totalAmount: parseFloat(order.totalAmount || 0),
          discount: parseFloat(order.discount || 0),
          shippingFee: parseFloat(order.shippingFee || 0),
          finalTotal: parseFloat(order.finalTotal || 0),
          paymentMethod: order.paymentMethod || 'COD',
          paymentStatus: order.paymentStatus || 'pending',
          shippingMethod: order.shippingMethod || 'standard',
          shippingStatus: order.shippingStatus || 'pending',
          note: order.note || '',
          status: order.status || 'pending',
          staffInfo: order.staffInfo || { name: 'Admin' },
          createdAt: order.createdAt || order.created_at || new Date().toISOString()
        };

        console.log('Processed order:', processedOrder);
        return processedOrder;
      });

      console.log('Final orders data:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
      toast.error(error.message || 'Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (orderId) => {
    console.log('Clicking order with ID:', orderId);
    if (!orderId) {
      console.error('Order ID is undefined');
      toast.error('Không thể xem chi tiết đơn hàng do thiếu ID');
      return;
    }
    navigate(`/employee/orders/${orderId}`);
  };

  const getStatusColor = (status, shippingMethod, paymentStatus) => {
    // Nếu là đơn nhận tại cửa hàng
    if (shippingMethod === "Nhận tại cửa hàng") {
      return paymentStatus === "paid" 
        ? 'text-green-600 bg-green-50'  // Đã xử lý
        : 'text-yellow-600 bg-yellow-50'; // Chờ thanh toán
    }

    // Đơn giao hàng
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'shipping': return 'text-orange-600 bg-orange-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getOrderStatus = (order) => {
    // Nếu là đơn nhận tại cửa hàng
    if (order.shippingMethod === "Nhận tại cửa hàng") {
      return order.paymentStatus === "paid"
        ? "Đã xử lý"
        : "Chờ thanh toán";
    }

    // Đơn giao hàng
    switch (order.status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return order.status;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50';
      case 'unpaid': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chưa xử lý giao hàng' },
    { id: 'shipping', label: 'Chờ lấy hàng' },
    { id: 'delivering', label: 'Đang giao hàng' },
    { id: 'unpaid', label: 'Chưa thanh toán' }
  ];

  const filteredOrders = orders.filter(order => {
    // Lọc theo tab
    if (activeTab === 'pending' && order.status !== 'pending') return false;
    if (activeTab === 'shipping' && order.shippingStatus !== 'pending') return false;
    if (activeTab === 'delivering' && order.shippingStatus !== 'delivering') return false;
    if (activeTab === 'unpaid' && order.paymentStatus !== 'unpaid') return false;

    // Lọc theo search
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.customerInfo?.name?.toLowerCase().includes(searchLower) ||
      order.customerInfo?.phone?.includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Danh sách đơn hàng</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-50 flex items-center gap-2">
              <Download size={20} />
              <span>Xuất file</span>
            </button>
            <button
              onClick={() => navigate('/employee/orders/new')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={20} />
              <span>Tạo đơn hàng</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hàng, vận đơn, SĐT khách hàng"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select className="border rounded-lg px-4 py-2">
              <option>Trạng thái giao hàng</option>
              <option>Đã giao</option>
              <option>Đang giao</option>
              <option>Chưa giao</option>
            </select>
            <select className="border rounded-lg px-4 py-2">
              <option>Ngày tạo</option>
              <option>Hôm nay</option>
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
            <button className="border rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-gray-50">
              <Filter size={20} />
              <span>Bộ lọc khác</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nguồn đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái xử lý
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => {
                      console.log('Order data:', order);
                      handleOrderClick(order._id);
                    }}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300" 
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.staffInfo?.name || 'Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.customerInfo.name}</div>
                      <div className="text-sm text-gray-500">{order.customerInfo.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {order.finalTotal?.toLocaleString()} đ
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status, order.shippingMethod, order.paymentStatus)}`}>
                        {getOrderStatus(order)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-500">
                Hiển thị 1 đến {filteredOrders.length} trên tổng số {orders.length} kết quả
              </div>
              <div className="flex gap-2">
                <select className="border rounded px-2 py-1 text-sm">
                  <option>20</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderList; 