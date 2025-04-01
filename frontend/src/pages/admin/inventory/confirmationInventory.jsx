import React, { useEffect, useState } from "react";
import { useProductStore } from "../../../store/useProductStore";

const AdminConfirmationStockList = () => {
  const {
    inventoryProductsForAdminConfirmed,
    isLoading,
    getProductsForAdminConfirmed,
    requestRecheckByAdmin,
    requestStockCheck,
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    document.title = "Danh sách sản phẩm đã xác nhận - Hệ thống Admin";
    getProductsForAdminConfirmed();
  }, [getProductsForAdminConfirmed]);

  const handleRequestStockCheck = async () => {
    try {
      await requestStockCheck();
    } catch (error) {
      console.error("Lỗi khi yêu cầu kiểm kho:", error);
    }
  };

  const handleRequestRecheck = async (id) => {
    setProcessingId(id);
    try {
      await requestRecheckByAdmin(id);
    } finally {
      setProcessingId(null);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredProducts = inventoryProductsForAdminConfirmed.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="stock-check-container p-4 bg-gray-50 rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Danh sách sản phẩm đã xác nhận</h1>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={handleRequestStockCheck}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Yêu cầu kiểm kho tất cả
        </button>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full p-2 pl-8 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-2 top-2.5 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{filteredProducts.length}</span> sản phẩm đã xác nhận
        </div>
        <div className="text-sm text-gray-600">
          Cập nhật: {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
          <div className="spinner"></div>
          <p className="ml-3 text-gray-600">Đang tải dữ liệu kiểm kho...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <p className="mt-2 text-gray-500">Không có sản phẩm nào đã được xác nhận kiểm kho</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("name")}
                >
                  <div className="flex items-center">
                    Tên sản phẩm
                    {sortConfig.key === "name" && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("quantity")}
                >
                  <div className="flex items-center">
                    Số lượng hệ thống
                    {sortConfig.key === "quantity" && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-black-100"
                  onClick={() => requestSort("pending_actual_quantity")}
                >
                  <div className="flex items-center">
                    Số lượng kiểm kho
                    {sortConfig.key === "pending_actual_quantity" && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort("is_checked_stock")}
                >
                  <div className="flex items-center">
                    Trạng thái
                    {sortConfig.key === "is_checked_stock" && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.pending_actual_quantity || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.is_checked_stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded transition duration-200 flex items-center"
                      onClick={() => handleRequestRecheck(product.id)}
                      disabled={processingId === product.id}
                    >
                      {processingId === product.id ? (
                        <>
                          <span className="loading-dots mr-1"></span>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <span>Kiểm kho lại</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminConfirmationStockList;