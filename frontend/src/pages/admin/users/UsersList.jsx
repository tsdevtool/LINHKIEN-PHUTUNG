import React, { useEffect, useState } from 'react';
import adminUserStore from '../../../store/adminUserStore';
import adminRoleStore from '../../../store/adminRoleStore';
import { toast } from 'react-toastify';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const [fetchedUsers, fetchedRoles] = await Promise.all([
          adminUserStore.getAllUsers(),
          adminRoleStore.getAllRoles(),
        ]);

        const roleMap = new Map(fetchedRoles.map((role) => [role.id, role.name]));

        const processedUsers = fetchedUsers.map((user) => ({
          ...user,
          roleName: roleMap.get(user.idrole) || 'Không xác định',
        }));

        setUsers(processedUsers);
        setRoles(fetchedRoles);
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu người dùng và vai trò');
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndRoles();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.phone.includes(searchTerm) ||
      user.roleName.toLowerCase().includes(searchLower)
    );
  });

  const getRoleClass = (roleName) => {
    switch (roleName) {
      case 'ADMIN':
        return 'text-red-600 font-bold'; // Màu đỏ cho ADMIN
      case 'EMPLOYEE':
        return 'text-blue-600 font-bold'; // Màu xanh dương cho EMPLOYEE
      case 'CUSTOMER':
        return 'text-green-600 font-bold'; // Màu xanh lá cho CUSTOMER
      default:
        return 'text-gray-600'; // Màu xám cho vai trò không xác định
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        {/* Thanh tìm kiếm */}
        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={handleSearch}
            className="p-2 border rounded-lg w-3/4"
          />
        </div>

        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
                  <th className="p-3 border">Tên</th>
                  <th className="p-3 border">Số điện thoại</th>
                  <th className="p-3 border">Vai trò</th>
                  <th className="p-3 border">Trạng thái</th>
                  <th className="p-3 border">Ngày tạo</th>
                  <th className="p-3 border">Ngày cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-100 text-center border-b">
                    <td className="p-3 border">{user.name}</td>
                    <td className="p-3 border">{user.phone}</td>
                    <td className={`p-3 border ${getRoleClass(user.roleName)}`}>{user.roleName}</td>
                    <td className="p-3 border">{user.status ? 'Hoạt động' : 'Không hoạt động'}</td>
                    <td className="p-3 border">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-3 border">{new Date(user.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-600">Không có người dùng nào.</div>
        )}
      </div>
    </div>
  );
};

export default UsersList;