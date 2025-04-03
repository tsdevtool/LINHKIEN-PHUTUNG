import axios from 'axios';
import { toast } from 'react-toastify';

// const API_URL = 'http://localhost:8000/admin/user';

export default {
  // Lấy tất cả nhân viên (không bao gồm khách hàng)
  async getAllEmployees() {
    try {
      const response = await axios.get(`/api/users/employees`);
      return response.data.users;
    } catch (error) {
      toast.error('Lỗi khi lấy danh sách nhân viên');
      return [];
    }
  },

  // Lấy chi tiết nhân viên theo ID
  async getEmployeeByID(id) {
    try {
      const response = await axios.get(`/api/users/employees/${id}`);
      return response.data.employee;
    } catch (error) {
      toast.error('Lỗi khi lấy thông tin nhân viên');
      return null;
    }
  },

  // Thêm nhân viên mới
  async addEmployee(employeeData) {
    try {
      const response = await axios.post('/api/users/employees/add', employeeData);
      toast.success(response.data.message);
      return response.data.user;
    } catch (error) {
      toast.error('Lỗi khi thêm nhân viên mới');
      return null;
    }
  },

  // Tìm kiếm nhân viên theo tên hoặc ID role
  async getEmployee(nameEmploy, IdRole) {
    try {
      const response = await axios.post('/api/users/employees/search', { nameEmploy, IdRole });
      return response.data.data;
    } catch (error) {
      toast.error('Lỗi khi tìm kiếm nhân viên');
      return [];
    }
  },

  // Cập nhật thông tin nhân viên
  async updateEmployee(id, employeeData) {
    try {
      const response = await axios.put(`/api/users/employees/update/${id}`, employeeData);
      toast.success(response.data.message);
      return response.data.user;
    } catch (error) {
      toast.error('Lỗi khi cập nhật nhân viên');
      return null;
    }
  },

  // Xóa nhân viên (Đặt cờ deleted_at)
  async deleteEmployee(id) {
    try {
      const response = await axios.delete(`/api/users/employees/${id}`);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Lỗi khi xoá nhân viên');
    }
  },

  // Khôi phục nhân viên đã bị xóa
  async undeleteEmployee(id) {
    try {
      const response = await axios.put(`/api/users/employees/undelete/${id}`);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Lỗi khi khôi phục nhân viên');
    }
  },
  async getAllUsers() {
    try {
      const response = await axios.get('/api/users/all');
      return response.data.users;
    } catch (error) {
      toast.error('Lỗi khi lấy danh sách người dùng');
      return [];
    }
  },
};
