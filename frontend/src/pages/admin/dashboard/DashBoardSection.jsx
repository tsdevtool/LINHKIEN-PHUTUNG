import React, { useState, useEffect } from "react";
import { 
  ArrowUp, ArrowDown, DollarSign, Users, ShoppingBag, 
  Clock, Calendar, LineChart, TrendingUp, Eye
} from "lucide-react";
import { useAuthStore } from "../../../store/authUser";
import axios from "axios";

// Sample chart component (would be replaced with a real chart library like recharts or chart.js)
const SimpleChart = ({ data, color }) => {
  return (
    <div className="h-32 flex items-end justify-between gap-1">
      {data.map((value, index) => (
        <div 
          key={index}
          style={{ 
            height: `${Math.max(15, value)}%`,
            backgroundColor: color || "#3b82f6"
          }}
          className="w-full rounded-t-md"
        ></div>
      ))}
    </div>
  );
};

const DashBoardSection = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: [],
    salesData: [35, 40, 30, 50, 60, 45, 55, 65, 75, 45, 55, 60],
    customerData: [20, 30, 40, 35, 45, 40, 50, 45, 60, 55, 65, 60],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    // This would be replaced with real API calls to your backend
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // In a real application, these would be separate API calls
        // const revenueData = await axios.get("/api/stats/revenue");
        // const orderData = await axios.get("/api/stats/orders");
        // etc.

        // Simulate API response delay
        setTimeout(() => {
          setStats({
            totalRevenue: 1250000000,
            totalOrders: 145,
            totalCustomers: 89,
            totalProducts: 243,
            recentOrders: [
              { id: "ORD-001", customer: "Nguyễn Văn A", amount: 2500000, status: "Đã giao", date: "2024-05-15" },
              { id: "ORD-002", customer: "Trần Thị B", amount: 1800000, status: "Đang xử lý", date: "2024-05-14" },
              { id: "ORD-003", customer: "Phạm Văn C", amount: 3400000, status: "Đang giao", date: "2024-05-14" },
              { id: "ORD-004", customer: "Lê Thị D", amount: 950000, status: "Đã giao", date: "2024-05-13" },
              { id: "ORD-005", customer: "Hoàng Văn E", amount: 4200000, status: "Đã giao", date: "2024-05-13" },
            ],
            topProducts: [
              { id: 1, name: "Bộ phận ô tô ABC", sales: 28, revenue: 42000000 },
              { id: 2, name: "Phụ tùng xe máy XYZ", sales: 23, revenue: 34500000 },
              { id: 3, name: "Linh kiện điện tử 123", sales: 19, revenue: 28500000 },
              { id: 4, name: "Bộ lọc nhiên liệu", sales: 15, revenue: 22500000 },
            ],
            salesData: [35, 40, 30, 50, 60, 45, 55, 65, 75, 45, 55, 60],
            customerData: [20, 30, 40, 35, 45, 40, 50, 45, 60, 55, 65, 60],
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeRange]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Đã giao": return "bg-green-100 text-green-800";
      case "Đang giao": return "bg-blue-100 text-blue-800";
      case "Đang xử lý": return "bg-yellow-100 text-yellow-800";
      case "Đã hủy": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="px-6 py-4">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Xin chào, {user?.firstname || "Admin"}!
          </h1>
          <p className="text-gray-600 mt-1">
            Đây là tổng quan hoạt động kinh doanh của bạn
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm nay</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2">
            <Calendar size={16} />
            <span>Báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Doanh thu</p>
              <h3 className="text-2xl font-bold mt-1">
                {isLoading ? "..." : stats.totalRevenue.toLocaleString('vi-VN')} đ
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-green-500 flex items-center text-xs font-medium">
                  <ArrowUp size={14} className="mr-1" /> 12.5%
                </span>
                <span className="text-gray-400 text-xs ml-2">so với {timeRange === "week" ? "tuần" : "tháng"} trước</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Đơn hàng</p>
              <h3 className="text-2xl font-bold mt-1">
                {isLoading ? "..." : stats.totalOrders}
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-green-500 flex items-center text-xs font-medium">
                  <ArrowUp size={14} className="mr-1" /> 8.2%
                </span>
                <span className="text-gray-400 text-xs ml-2">so với {timeRange === "week" ? "tuần" : "tháng"} trước</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingBag size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Khách hàng</p>
              <h3 className="text-2xl font-bold mt-1">
                {isLoading ? "..." : stats.totalCustomers}
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-green-500 flex items-center text-xs font-medium">
                  <ArrowUp size={14} className="mr-1" /> 5.3%
                </span>
                <span className="text-gray-400 text-xs ml-2">so với {timeRange === "week" ? "tuần" : "tháng"} trước</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Sản phẩm</p>
              <h3 className="text-2xl font-bold mt-1">
                {isLoading ? "..." : stats.totalProducts}
              </h3>
              <div className="flex items-center mt-2">
                <span className="text-red-500 flex items-center text-xs font-medium">
                  <ArrowDown size={14} className="mr-1" /> 1.8%
                </span>
                <span className="text-gray-400 text-xs ml-2">so với {timeRange === "week" ? "tuần" : "tháng"} trước</span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <TrendingUp size={24} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800">Doanh số bán hàng</h3>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
              <span className="text-xs text-gray-500 mr-4">Doanh số</span>
              <button className="text-gray-400 hover:text-gray-600">
                <Eye size={16} />
              </button>
            </div>
          </div>
          <div className={isLoading ? "opacity-50" : ""}>
            <SimpleChart data={stats.salesData} color="#3b82f6" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>T1</span>
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>T8</span>
              <span>T9</span>
              <span>T10</span>
              <span>T11</span>
              <span>T12</span>
            </div>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800">Tăng trưởng khách hàng</h3>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
              <span className="text-xs text-gray-500 mr-4">Khách hàng mới</span>
              <button className="text-gray-400 hover:text-gray-600">
                <Eye size={16} />
              </button>
            </div>
          </div>
          <div className={isLoading ? "opacity-50" : ""}>
            <SimpleChart data={stats.customerData} color="#8b5cf6" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>T1</span>
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
              <span>T7</span>
              <span>T8</span>
              <span>T9</span>
              <span>T10</span>
              <span>T11</span>
              <span>T12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800">Đơn hàng gần đây</h3>
            <button className="text-blue-600 text-sm hover:underline">Xem tất cả</button>
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="py-2 border-b border-gray-100">
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Mã đơn</th>
                    <th className="pb-3">Khách hàng</th>
                    <th className="pb-3">Số tiền</th>
                    <th className="pb-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-100">
                      <td className="py-3 text-sm">{order.id}</td>
                      <td className="py-3 text-sm">{order.customer}</td>
                      <td className="py-3 text-sm font-medium">{order.amount.toLocaleString('vi-VN')} đ</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-800">Sản phẩm bán chạy</h3>
            <button className="text-blue-600 text-sm hover:underline">Xem tất cả</button>
          </div>
          {isLoading ? (
            <div className="animate-pulse">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="py-3 border-b border-gray-100">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {stats.topProducts.map((product, index) => (
                <div key={product.id} className="py-3 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-700 font-semibold mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">Đã bán: {product.sales} sản phẩm</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{product.revenue.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashBoardSection;
