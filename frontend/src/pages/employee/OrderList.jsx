import React, { useState, useEffect } from 'react';
import { Search, Download, Plus, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import orderService from './services/orderService';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Loading from '../../components/ui/Loading';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    field: 'created_at',
    order: 'desc'
  });
  const [filters, setFilters] = useState({
    status: '',
    shipping_status: '',
    date_range: ''
  });
  const navigate = useNavigate();
  const location = useLocation();

  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrders({
        ...params,
        sort_by: sortConfig.field,
        sort_order: sortConfig.order,
        ...filters
      });

      let ordersData = [];
      if (Array.isArray(response)) {
        ordersData = response;
      } else if (response?.orders && Array.isArray(response.orders)) {
        ordersData = response.orders;
      } else if (response?.data && Array.isArray(response.data)) {
        ordersData = response.data;
      }

      // Validate và chuẩn hóa dữ liệu đơn hàng
      ordersData = ordersData.map(order => ({
        _id: order._id || order.id,
        order_number: order.order_number,
        customer_info: {
          name: order.customer_info?.name || 'Không có tên',
          phone: order.customer_info?.phone || 'Không có SĐT',
          address: order.customer_info?.address || 'Không có địa chỉ'
        },
        items: Array.isArray(order.items) ? order.items : [],
        total_amount: parseFloat(order.total_amount || 0),
        discount: parseFloat(order.discount || 0),
        shipping_fee: parseFloat(order.shipping_fee || 0),
        finaltotal: parseFloat(order.finaltotal || 0),
        payment_method: order.payment_method || 'COD',
        payment_status: order.payment_status || 'pending',
        shipping_method: order.shipping_method || 'standard',
        shipping_status: order.shipping_status || 'pending',
        note: order.note || '',
        status: order.status || 'pending',
        staff_info: order.staff_info || { name: 'client' },
        created_at: order.created_at || new Date().toISOString()
      }));

      setOrders(ordersData);
    } catch (error) {
     
      setError(error.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [sortConfig, filters]);

  const handleSort = (field) => {
    setSortConfig({
      field,
      order: 'desc'
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getSortIcon = (field) => {
    if (sortConfig.field !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return <ChevronDown className="w-4 h-4 text-blue-500" />;
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const handleOrderClick = (orderId) => {
 
    if (!orderId) {
     
      toast.error('Không thể xem chi tiết đơn hàng do thiếu ID');
      return;
    }

    // Xác định route prefix dựa vào current path
    const isAdminRoute = location.pathname.startsWith('/admin');
    const routePrefix = isAdminRoute ? '/admin' : '/employee';
    
    navigate(`${routePrefix}/orders/${String(orderId)}`);
  };

  const handleCreateOrder = () => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    const routePrefix = isAdminRoute ? '/admin' : '/employee';
    navigate(`${routePrefix}/orders/new`);
  };

  const getStatusColor = (status, shipping_method, payment_status) => {
    // Nếu là đơn nhận tại cửa hàng
    if (shipping_method === "Nhận tại cửa hàng") {
      return payment_status === "paid" 
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
    if (order.shipping_method === "Nhận tại cửa hàng") {
      return order.payment_status === "paid"
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

  // Determine order source (employee or client)
  const getOrderSource = (order) => {
    // Check if staff_id exists and is not empty
    if (order.staff_id && 
        typeof order.staff_id === 'string' && order.staff_id.length > 0) {
      return 'Employee';
    }
    
    // If staff_info exists with a name that is not a default value
    if (order.staff_info && order.staff_info.name && 
        order.staff_info.name !== 'client') {
      return 'Employee';
    }
    
    return 'Client';
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
    if (activeTab === 'shipping' && order.shipping_status !== 'pending') return false;
    if (activeTab === 'delivering' && order.shipping_status !== 'delivering') return false;
    if (activeTab === 'unpaid' && order.payment_status !== 'unpaid') return false;

    // Lọc theo search
    const searchLower = searchTerm.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.customer_info?.name?.toLowerCase().includes(searchLower) ||
      order.customer_info?.phone?.includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Danh sách đơn hàng</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-gray-600 dark:text-white border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
              <Download size={20} />
              <span>Xuất file</span>
            </button>
            <button
              onClick={handleCreateOrder}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 flex items-center gap-2"
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

        {/* Filters */}
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
            <select 
              className="border rounded-lg px-4 py-2"
              value={filters.shipping_status}
              onChange={(e) => handleFilterChange('shipping_status', e.target.value)}
            >
              <option value="">Trạng thái giao hàng</option>
              <option value="delivered">Đã giao</option>
              <option value="shipping">Đang giao</option>
              <option value="pending">Chưa giao</option>
            </select>
            <select 
              className="border rounded-lg px-4 py-2"
              value={filters.date_range}
              onChange={(e) => handleFilterChange('date_range', e.target.value)}
            >
              <option value="">Ngày tạo</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('order_number')}
                  >
                    <div className="flex items-center gap-1">
                      Mã đơn hàng
                      {getSortIcon('order_number')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('staff_info.name')}
                  >
                    <div className="flex items-center gap-1">
                      Nguồn đơn
                      {getSortIcon('staff_info.name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-1">
                      Ngày tạo
                      {getSortIcon('created_at')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('finaltotal')}
                  >
                    <div className="flex items-center gap-1">
                      Thành tiền
                      {getSortIcon('finaltotal')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('payment_status')}
                  >
                    <div className="flex items-center gap-1">
                      Trạng thái thanh toán
                      {getSortIcon('payment_status')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Trạng thái xử lý
                      {getSortIcon('status')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  // Đảm bảo key luôn là string
                  const orderId = typeof order._id === 'object' 
                    ? (order._id.$oid || order._id.toString()) 
                    : String(order._id);
                    
                  return (
                    <tr
                      key={orderId}
                      onClick={() => handleOrderClick(orderId)}
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
                        {getOrderSource(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.customer_info.name}</div>
                        <div className="text-sm text-gray-500">{order.customer_info.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {order.finaltotal?.toLocaleString()} đ
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status === 'paid' 
                            ? 'Đã thanh toán' 
                            : order.payment_status === 'pending'
                            ? 'Đang chờ thanh toán'
                            : 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status, order.shipping_method, order.payment_status)}`}>
                          {getOrderStatus(order)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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