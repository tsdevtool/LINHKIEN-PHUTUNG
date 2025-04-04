import React, { useEffect, useState } from "react";
import { useProductStore } from "../../../store/useProductStore";

const AdminStockCheck = () => {
  const {
    inventoryProductsForAdminWaiting,
    isLoading,
    getProductsForAdminWaitingConfirmation,
    confirmStockCheckByAdmin,
    requestRecheckByAdmin,
  } = useProductStore();
  
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  
  useEffect(() => {
    document.title = "Quản lý kiểm kho - Hệ thống Admin";
    getProductsForAdminWaitingConfirmation();
  }, [getProductsForAdminWaitingConfirmation]);

  const handleConfirmStockCheck = async (id) => {
    setProcessingId(id);
    try {
      await confirmStockCheckByAdmin(id);
    } finally {
      setProcessingId(null);
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
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Calculate status for stock discrepancies
  const getStockStatus = (product) => {
    const actual = parseInt(product.quantity, 10);
    const checked = parseInt(product.pending_actual_quantity, 10);
    
    if (actual === checked) return { status: "Khớp", className: "status-match" };
    if (actual > checked) return { status: "Thiếu", className: "status-shortage" };
    return { status: "Thừa", className: "status-excess" };
  };

  const filteredProducts = inventoryProductsForAdminWaiting.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (sortConfig.key === 'status') {
      const statusA = getStockStatus(a).status;
      const statusB = getStockStatus(b).status;
      
      if (statusA < statusB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (statusA > statusB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    }
    
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý kiểm kho</h1>
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
          <span className="font-medium">{filteredProducts.length}</span> sản phẩm cần xác nhận
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
          <div className="spinner"></div>
          <p className="ml-3 text-gray-600">Đang tải dữ liệu kiểm kho...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-gray-500">Không có sản phẩm nào đang chờ xác nhận kiểm kho</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
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
                    Số lượng hệ thống
                    {sortConfig.key === 'quantity' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('pending_actual_quantity')}
                >
                  <div className="flex items-center">
                    Số lượng kiểm kho
                    {sortConfig.key === 'pending_actual_quantity' && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('status')}
                >
                  <div className="flex items-center">
                    Trạng thái
                    {sortConfig.key === 'status' && (
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
              {sortedProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 truncate max-w-xs">{product.name}</div>
                      {product.sku && <div className="text-sm text-gray-500">SKU: {product.sku}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.pending_actual_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stockStatus.className}`}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded transition duration-200 flex items-center"
                          onClick={() => handleConfirmStockCheck(product.id)}
                          disabled={processingId === product.id}
                        >
                          {processingId === product.id ? (
                            <>
                              <span className="loading-dots mr-1"></span>
                              <span>Đang xử lý...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Xác nhận</span>
                            </>
                          )}
                        </button>
                        <button
                          className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded transition duration-200 flex items-center"
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
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Kiểm lại</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .status-match {
          background-color: #d1fae5;
          color: #065f46;
        }
        
        .status-shortage {
          background-color: #fee2e2;
          color: #b91c1c;
        }
        
        .status-excess {
          background-color: #dbeafe;
          color: #1e40af;
        }
        
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #3498db;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        
        .loading-dots {
          position: relative;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #ffffff;
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
        }
        
        .loading-dots::before, .loading-dots::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
        }
        
        .loading-dots::before {
          left: -15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #ffffff;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 0s;
        }
        
        .loading-dots::after {
          left: 15px;
          width: 10px;
          height: 10px;
          border-radius: 5px;
          background-color: #ffffff;
          animation: dot-flashing 1s infinite alternate;
          animation-delay: 1s;
        }
        
        @keyframes dot-flashing {
          0% {
            background-color: #ffffff;
          }
          50%, 100% {
            background-color: rgba(255, 255, 255, 0.2);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminStockCheck;