import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import customerRepository from '../repositories/customerRepository';

const NewCustomer = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstname || !formData.phone) {
      toast.error('Vui lòng điền họ và số điện thoại');
      return;
    }

    try {
      setLoading(true);
      const customerData = {
        firstname: formData.firstname,
        lastname: formData.lastname || '',
        phone: formData.phone,
        password: formData.phone,
        idrole: '67dac2f4e2b2c2309a07727d',
        status: true,
        address: '',
        image: ''
      };

      console.log('Sending customer data:', customerData);
      const response = await customerRepository.createCustomer(customerData);
      console.log('Response:', response);
      
      toast.success('Thêm khách hàng mới thành công!');
      const customer = response.customer;
      
      // Trả về dữ liệu khách hàng từ API response
      if (response && response.customer) {
        onSuccess({
          phone: response.customer.phone
        });
      }
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Có lỗi xảy ra khi thêm khách hàng';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>

          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thêm khách hàng mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Họ *
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nhập họ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nhập tên (không bắt buộc)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm disabled:bg-blue-400"
              >
                {loading ? 'Đang xử lý...' : 'Thêm khách hàng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCustomer; 