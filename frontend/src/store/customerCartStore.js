import axios from 'axios';
import toast from 'react-hot-toast';

// const API_URL = 'http://localhost:8000/api/roles';

const adminRoleStore = {
    //lấy toàn bộ danh sách role
  async getAllRoles() {
    try {
      const response = await axios.get('/api/roles');
      return response.data.roles;
    } catch (error) {
      toast.error('Lỗi khi lấy danh sách roles');
      return [];
    }
  },
//lấy toàn bộ danh sách role ko bị xóa
  async getAllNoDelete() {
    try {
      const response = await axios.get('/api/roles/nodele');
      return response.data.roles;
    } catch (error) {
      toast.error('Lỗi khi lấy danh sách roles chưa bị xoá');
      return [];
    }
  },
//thêm mới role
  async addRole(name) {
    try {
      const response = await axios.post('/api/roles', { name });
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Lỗi khi thêm role mới');
    }
  },
//chỉnh sửa 
  async updateRole(id, name) {
    try {
      const response = await axios.put('/api/roles/update/${id}', { name });
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Lỗi khi cập nhật role');
    }
  },

  async deleteRole(id) {
    try {
      const response = await axios.delete('/api/roles/delete/${id}');
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Lỗi khi xoá role');
    }
  },
//
  async restoreRole(id) {
    try {
      const response = await axios.post('/api/roles/undelete/${id}');
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Lỗi khi khôi phục role');
    }
  }
};

export default adminRoleStore;
