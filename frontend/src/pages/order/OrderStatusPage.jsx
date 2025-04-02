import { useEffect } from "react";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import useOrderStore from "../../store/Cart/useOrderStore";

const OrderStatusPage = () => {
  const { orders, getAllOrders, isLoading } = useOrderStore();

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  useEffect(() => {
    console.log('Orders data:', orders);
  }, [orders]);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return '0';
    return value.toLocaleString('vi-VN');
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipping':
        return 'bg-cyan-100 text-cyan-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'Đã thanh toán';
      case 'unpaid':
        return 'Chưa thanh toán';
      default:
        return 'Chưa xác định';
    }
  };

  const getPaymentTypeText = (type) => {
    switch (type?.toLowerCase()) {
      case 'cash':
        return 'Tiền mặt';
      case 'payos':
        return 'PayOS';
      default:
        return 'Chưa có';
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <Navbar />

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tiêu đề */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Đơn hàng của tôi
            </h1>
          </div>

          {/* Danh sách đơn hàng */}
          <div className="space-y-6">
            {!orders || orders.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Bạn chưa có đơn hàng nào
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Mã đơn hàng: #{order.order_number || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ngày đặt: {order.created_at || 'N/A'}
                      </p>
                      <p className="mt-2 font-medium text-cyan-600">
                        {formatCurrency(order.final_total)}đ
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                        {order.status === 'completed' ? 'Hoàn thành' : 
                         order.status === 'pending' ? 'Chờ xác nhận' :
                         order.status || 'Chờ xác nhận'}
                      </span>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Thanh toán: {getPaymentStatusText(order.payment_status)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getPaymentTypeText(order.payment_type)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.items_count || 0} sản phẩm
                    </p>
                    <button className="text-cyan-600 hover:text-cyan-700 font-medium">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
