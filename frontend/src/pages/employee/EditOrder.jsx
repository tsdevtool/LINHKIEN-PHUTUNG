import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import orderService from './services/orderService';
import productService from './services/productService';
import { toast } from 'react-hot-toast';

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer_info, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  useEffect(() => {
    if (order) {
      setCustomerInfo(order.customer_info || {});
      setItems(order.items || []);
      if (order.items?.length > 0) {
        fetchProductDetails(order.items);
      }
    }
  }, [order]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      console.log('Order detail response:', response);
      
      // Kiểm tra response và lấy dữ liệu đơn hàng
      let orderData = null;
      if (response.order) {
        orderData = response.order;
      } else if (response.data) {
        orderData = response.data;
      } else if (typeof response === 'object' && !response.success) {
        orderData = response;
      }

      if (orderData) {
        console.log('Setting order data:', orderData);
        setOrder(orderData);
      } else {
        throw new Error('Không tìm thấy thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(error.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (orderItems) => {
    try {
      const productIds = orderItems.map(item => item.product_id);
      const productPromises = productIds.map(product_id => 
        productService.getProductById(product_id)
          .then(response => {
            if (response.success && response.product) {
              return [product_id, response.product];
            }
            return null;
          })
      );

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
      toast.error('Không thể tải thông tin chi tiết sản phẩm');
    }
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity: parseInt(value) || 0,
      total: (parseInt(value) || 0) * newItems[index].price
    };
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const total_amount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping_fee = order?.shipping_fee || 0;
    const discount = order?.discount || 0;
    const finaltotal = total_amount + shipping_fee - discount;
    return { total_amount, finaltotal };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { total_amount, finaltotal } = calculateTotals();
      
      // Validate required fields
      if (!customer_info.name || !customer_info.phone || !customer_info.address) {
        toast.error('Vui lòng điền đầy đủ thông tin khách hàng');
        return;
      }

      if (items.length === 0) {
        toast.error('Đơn hàng phải có ít nhất một sản phẩm');
        return;
      }

      if (items.some(item => !item.quantity || item.quantity <= 0)) {
        toast.error('Số lượng sản phẩm phải lớn hơn 0');
        return;
      }

      const updatedOrder = {
        ...order,
        customer_info,
        items: items.map(item => ({
          ...item,
          total: item.price * item.quantity
        })),
        total_amount,
        finaltotal,
        updated_at: new Date().toISOString()
      };

      console.log('Updating order with data:', updatedOrder);

      const response = await orderService.updateOrder(id, updatedOrder);
      console.log('Update response:', response);

      if (response.success) {
        toast.success('Đã cập nhật đơn hàng');
        // Đợi toast hiển thị xong rồi mới chuyển trang
        setTimeout(() => {
          navigate(`/employee/orders/${id}`);
        }, 1000);
      } else {
        throw new Error(response.message || 'Không thể cập nhật đơn hàng');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      toast.error(error.message || 'Không thể cập nhật đơn hàng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
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
                onClick={() => navigate(`/employee/orders/${id}`)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sửa đơn hàng {order?.order_number}
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Sản phẩm</h2>
              <div className="space-y-4">
                {items.map((item, index) => {
                  const productDetail = productDetails[item.product_id];
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
                          {productDetail?.category?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          className="w-20 px-3 py-2 border rounded-md"
                        />
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tổng tiền hàng</span>
                  <span>{calculateTotals().total_amount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Giảm giá</span>
                  <span>-{(order?.discount || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí giao hàng</span>
                  <span>{(order?.shipping_fee || 0).toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Thành tiền</span>
                  <span>{calculateTotals().finaltotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customer_info.name || ''}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={customer_info.phone || ''}
                    onChange={handleCustomerInfoChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ giao hàng
                  </label>
                  <textarea
                    name="address"
                    value={customer_info.address || ''}
                    onChange={handleCustomerInfoChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrder; 