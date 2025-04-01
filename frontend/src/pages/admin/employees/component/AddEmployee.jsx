import React, { useState, useEffect } from 'react';
import UserService from './../../../../store/adminUserStore';
import RoleService from './../../../../store/adminRoleStore.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddEmployee = ({ onClose ,onAddEmployee }) => {
  const [employee, setEmployee] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    password: '',
    address: '',
    image: '',
    numberOfOrder: null,
    numberOfOrders: null,
    totalSpent: null,
    status: true,
    idrole: 'Nhân viên',
  });
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const fetchedRoleData = await RoleService.getAllRoles();
        const updatedRoleData = fetchedRoleData.map((role) => ({
          ...role,
          name: changeNameRole(role.name),
        }));
        setRoleData(updatedRoleData);
        setLoading(false);
      } catch (error) {
        alert('Lỗi khi tải dữ liệu vai trò!');
      }
    };
    fetchRoles();
  }, []);

  const changeNameRole = (nameRole) => {
    switch (nameRole) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'EMPLOYEE':
        return 'Nhân viên';
      case 'CUSTOMER':
        return 'Khách hàng';
      default:
        return 'Không xác định';
    }
  };

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employee.firstname || !employee.lastname || !employee.phone || !employee.idrole) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (!employee.email) {
        employee.email = '';
      }
    try {
      const matchedRole = roleData.find((role) => role.name === employee.idrole);
      if (matchedRole) {
        employee.idrole = matchedRole.id;
      }

      await UserService.addEmployee(employee);
      alert('Thêm nhân viên thành công!');
      onAddEmployee();
      onClose();

    } catch (error) {
      alert('Lỗi khi thêm nhân viên!');
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-10">
      <div className="bg-white p-8 rounded-xl shadow-xl w-1/2 max-w-full relative z-20">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Thêm nhân viên mới</h2>
        {loading ? (
          <div className="text-center text-gray-600">Đang tải dữ liệu vai trò...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <div className="mb-6">
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">Họ</label>
                <input
                  type="text"
                  name="firstname"
                  value={employee.firstname}
                  onChange={handleChange}
                  className="mt-2 p-3 w-full max-w-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Tên</label>
                <input
                  type="text"
                  name="lastname"
                  value={employee.lastname}
                  onChange={handleChange}
                  className="mt-2 p-3 w-full max-w-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={employee.email}
                  onChange={handleChange}
                  className="mt-2 p-3 w-full max-w-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={employee.phone}
                  onChange={handleChange}
                  className="mt-2 p-3 w-full max-w-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                <input
                  type="text"
                  name="password"
                  value={employee.password}
                  onChange={handleChange}
                  className="mt-2 p-3 w-full max-w-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-400 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 hover:bg-gray-500 focus:ring-2 focus:ring-gray-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 hover:bg-blue-600 focus:ring-2 focus:ring-blue-600"
              >
                Lưu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddEmployee;
