import React, { useEffect, useState } from "react";
import { useProductStore } from "../../../store/useProductStore";

const EmployeeStockCheck = () => {
  const {
    inventoryProductsForEmployee,
    isLoading,
    getProductsForEmployee,
    confirmStockCheck,
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    getProductsForEmployee();
  }, [getProductsForEmployee]);

  const handleQuantityChange = (e, id) => {
    const value = e.target.value === "" ? "" : parseInt(e.target.value, 10);
    const updatedProducts = inventoryProductsForEmployee.map((product) =>
      product.id === id
        ? { ...product, pending_actual_quantity: value }
        : product
    );
    useProductStore.setState({ inventoryProductsForEmployee: updatedProducts });
  };

  const handleCheckStock = (id, pendingQuantity) => {
    if (pendingQuantity === "" || pendingQuantity === undefined) {
      alert("Vui lòng nhập số lượng kiểm kho");
      return;
    }
    confirmStockCheck(id, pendingQuantity);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getStatusLabel = (status) => {
    if (!status) return "Chưa kiểm kho";
    return status === "true" || status === true ? "Đã kiểm kho" : "Chưa kiểm kho";
  };

  const getStatusClass = (status) => {
    if (!status) return "status-pending";
    return status === "true" || status === true ? "status-checked" : "status-pending";
  };

  const filteredProducts = inventoryProductsForEmployee.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="stock-check-container p-4 bg-gray-50 rounded-lg shadow">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Kiểm Kho Sản Phẩm</h1>
        <p className="text-gray-600">Quản lý và cập nhật số lượng sản phẩm trong kho</p>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="relative w-64">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="text-sm text-gray-600">
          Tổng số sản phẩm: <span className="font-medium">{filteredProducts.length}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
          <p className="ml-3 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-2">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      Tên sản phẩm
                      {sortConfig.key === 'name' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('quantity')}
                  >
                    <div className="flex items-center">
                      Số lượng thực tế
                      {sortConfig.key === 'quantity' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số lượng kiểm kho
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => requestSort('is_checked_stock')}
                  >
                    <div className="flex items-center">
                      Trạng thái
                      {sortConfig.key === 'is_checked_stock' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'ascending' ? '▲' : '▼'}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={product.pending_actual_quantity || ""}
                        onChange={(e) => handleQuantityChange(e, product.id)}
                        className="p-2 w-24 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập số lượng"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(product.is_checked_stock)}`}>
                        {getStatusLabel(product.is_checked_stock)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCheckStock(product.id, product.pending_actual_quantity)}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded transition duration-200"
                        disabled={product.is_checked_stock === true || product.is_checked_stock === "true"}
                      >
                        {product.is_checked_stock === true || product.is_checked_stock === "true" 
                          ? "Đã kiểm kho" 
                          : "Cập nhật"
                        }
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style jsx>{`
        .status-checked {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-pending {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #3498db;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EmployeeStockCheck;