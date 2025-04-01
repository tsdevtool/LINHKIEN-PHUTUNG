// import React, { useEffect, useState } from 'react';
// import UserService from './../../../store/adminUserStore.js';
// import RoleService from './../../../store/adminRoleStore.js';
// import AddEmployee from './component/AddEmployee.jsx';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const EmployeeList = () => {
//   const [employees, setEmployees] = useState([]);
//   const [roleData, setRoleData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [editEmployee, setEditEmployee] = useState(null); 
//   const [addEmployee, setAddEmployee] = useState(false); 

//   const handleOpenAddEmployee = () => {
//     setAddEmployee(true); // Mở form thêm nhân viên
//   };

//   const handleCloseAddEmployee = () => {
//     setAddEmployee(false); // Đóng form thêm nhân viên
//   };
//   const handleAddEmployee = () => {
//     fetchEmployees();  // Tải lại danh sách nhân viên sau khi thêm
//   };
//   function ConvertDate(isoDateString) {
//     return new Date(isoDateString).toLocaleString('vi-VN', { hour12: false });
//   }

//   function arrangeList(employees) {
//     return employees.sort((a, b) => a.idrole.localeCompare(b.idrole));
//   }
//   function changeNameRole(nameRole) {
//     switch (nameRole) {
//       case 'ADMIN': return 'Quản trị viên';
//       case 'EMPLOYEE': return 'Nhân viên';
//       case 'CUSTOMER': return 'Khách hàng';
//       default: return 'Không xác định';
//     }
//   }
//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const [employeeData, fetchedRoleData] = await Promise.all([
//         UserService.getAllEmployees(),
//         RoleService.getAllRoles(),
//       ]);
  
//       // Sử dụng biến mới thay vì gán lại roleData
//       const updatedRoleData = fetchedRoleData.map((rd) => ({
//         ...rd,
//         name: changeNameRole(rd.name),
//       }));
  
//       const roleMap = new Map(updatedRoleData.map((role) => [role.id, role.name]));
  
//       const processedEmployees = arrangeList(
//         employeeData.map((emp) => ({
//           ...emp,
//           idrole: roleMap.get(emp.idrole) || 'Không xác định',
//           created_at: ConvertDate(emp.created_at),
//           updated_at: ConvertDate(emp.updated_at),
//           deleted_at: emp.deleted_at ? ConvertDate(emp.deleted_at) : '-',
//         }))
//       );
  
//       setEmployees(processedEmployees);
//       setRoleData(updatedRoleData); // Cập nhật state với danh sách role mới
//     } catch (error) {
//       toast.error('Lỗi khi tải dữ liệu!');
//     }
//     setLoading(false);
//   };
  

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const handleSearch = (event) => {
//     setSearchTerm(event.target.value);
//   };

//   const filteredEmployees = employees.filter(emp => {
//     const searchLower = searchTerm.toLowerCase();
//     return (
//       `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(searchLower) || // Tìm theo họ & tên
//       emp.phone.includes(searchTerm) || // Tìm theo số điện thoại
//       emp.idrole.toLowerCase().includes(searchLower) // Tìm theo vai trò
//     );
//   });

//   const handleEdit = (id) => {
//     const employee = employees.find(emp => emp.id === id);
//     console.log(employee);
//     console.log(roleData);
//     setEditEmployee(employee); // Cập nhật nhân viên cần chỉnh sửa
//   };

//   const handleCancelEdit = () => {
//     setEditEmployee(null); // Đóng form chỉnh sửa
//   };

//   const handleSave = async (event) => {
//     event.preventDefault(); // Ngăn form reload lại trang
  
//     if (!editEmployee.firstname || !editEmployee.lastname || !editEmployee.phone) {
//       alert('Vui lòng nhập đầy đủ thông tin!');
//       return;
//     }
  
//     try {
//       const matchedRole = roleData.find(role => role.name === editEmployee.idrole);
//       if (matchedRole) {
//         editEmployee.idrole = matchedRole.id;
//       }
//       await UserService.updateEmployee(editEmployee.id, editEmployee);
//       alert('Thông tin nhân viên đã được cập nhật!');
//       fetchEmployees(); // Tải lại danh sách nhân viên sau khi cập nhật
//       setEditEmployee(null); // Đóng form chỉnh sửa
//     } catch (error) {
//       alert('Lỗi khi cập nhật nhân viên!');
//     }
//   };
  

//   const handleDelete = async (id) => {
//     if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
//       try {
//         const Em = await UserService.getEmployeeByID(id);
//         if (Em) {
//           await UserService.deleteEmployee(id);
//           alert(`Đã xóa nhân viên: ${Em.firstname} ${Em.lastname}`);
//           fetchEmployees();
//         } else {
//           alert('Không tìm thấy nhân viên!');
//         }
//       } catch (error) {
//         alert('Lỗi khi xóa nhân viên!');
//       }
//     }
//   };

//   const handleRestore = async (id) => {
//     if (window.confirm('Bạn có chắc muốn mở khóa nhân viên này?')) {
//       try {
//         const Em = await UserService.getEmployeeByID(id);
//         if (Em) {
//           await UserService.undeleteEmployee(id);
//           alert(`Đã mở khóa nhân viên: ${Em.firstname} ${Em.lastname}`);
//           fetchEmployees();
//         } else {
//           alert('Không tìm thấy nhân viên!');
//         }
//       } catch (error) {
//         alert('Lỗi khi mở khóa nhân viên!');
//       }
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        
//       <div className="flex justify-between items-center mb-6">
//         {/* Thanh tìm kiếm */}
//           <input 
//             type="text" 
//             placeholder="Tìm kiếm nhân viên..." 
//             value={searchTerm} 
//             onChange={handleSearch} 
//             className="p-2 border rounded-lg w-3/4"  // Tăng chiều rộng của thanh tìm kiếm
//           />
        
//         {/* Nút thêm nhân viên */}
//           <button
//             onClick={handleOpenAddEmployee}
//             className="bg-green-500 text-white px-4 py-2 rounded-md ml-12"  // Khoảng cách trái cho nút là 50px (ml-12)
//           >
//             Thêm nhân viên
//           </button>
//       </div>

//         {loading ? (
//           <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
//               <thead>
//                 <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
//                   <th className="p-3 border">Tên nhân viên</th>
//                   <th className="p-3 border">SĐT</th>
//                   <th className="p-3 border">Vai Trò</th>
//                   <th className="p-3 border">Ngày tạo</th>
//                   <th className="p-3 border">Ngày chỉnh sửa</th>
//                   <th className="p-3 border">Ngày xóa</th>
//                   <th className="p-3 border">Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredEmployees.map(employee => (
//                   <tr key={employee.id} className="hover:bg-gray-100 text-center border-b">
//                     <td className="p-3 border">{employee.firstname} {employee.lastname}</td>
//                     <td className="p-3 border">{employee.phone}</td>
//                     <td className="p-3 border font-medium text-indigo-600">{employee.idrole}</td>
//                     <td className="p-3 border">{employee.created_at}</td>
//                     <td className="p-3 border">{employee.updated_at}</td>
//                     <td className="p-3 border text-red-500">{employee.deleted_at}</td>
//                     <td className="p-3 border">
//                       <button onClick={() => handleEdit(employee.id)} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Sửa</button>
//                       {employee.deleted_at !== '-' ? (
//                         <button 
//                           onClick={() => handleRestore(employee.id)} 
//                           className="bg-green-500 text-white px-3 py-1 rounded"
//                         >
//                           Hủy
//                         </button>
//                       ) : (
//                         <button 
//                           onClick={() => handleDelete(employee.id)} 
//                           className="bg-red-500 text-white px-3 py-1 rounded"
//                         >
//                           Xóa
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//       {addEmployee && <AddEmployee onClose={handleCloseAddEmployee} onAddEmployee={handleAddEmployee} />}
//       {/* Form Edit */}
//       {editEmployee && (
//        <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-10">
//        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 relative z-20">
//          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Chỉnh sửa thông tin</h2>
//          <form onSubmit={(e) => {
//            e.preventDefault();
//            handleSave(editEmployee);
//          }}>
//            <div className="mb-6">
//              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">Họ</label>
//              <input
//                type="text"
//                name="firstname"
//                value={editEmployee.firstname}
//                onChange={(e) => setEditEmployee({ ...editEmployee, firstname: e.target.value })}
//                className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//              />
//            </div>
//            <div className="mb-6">
//              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Tên</label>
//              <input
//                type="text"
//                name="lastname"
//                value={editEmployee.lastname}
//                onChange={(e) => setEditEmployee({ ...editEmployee, lastname: e.target.value })}
//                className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//              />
//            </div>
//            <div className="mb-6">
//              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
//              <input
//                type="text"
//                name="phone"
//                value={editEmployee.phone}
//                onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
//                className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//              />
//            </div>
//            <div className="mb-6">
//              <label htmlFor="idrole" className="block text-sm font-medium text-gray-700">Quyền hạn</label>
//              <select
//                 name="role"
//                 value={String(editEmployee.idrole)}
//                 onChange={(e) => setEditEmployee({ ...editEmployee, idrole: e.target.value })}
//                 className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {roleData.map((role) => (
//                   <option key={role.id} value={String(role.name)}> {/* Ép kiểu thành chuỗi */}
//                     {role.name}
//                   </option>
//                 ))}
//               </select>
//            </div>
//            <div className="flex justify-end gap-4">
//              <button 
//                type="button" 
//                onClick={handleCancelEdit} 
//                className="bg-gray-400 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 hover:bg-gray-500"
//              >
//                Hủy
//              </button>
//              <button 
//                type="submit" 
//                onClick={handleSave}
//                className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md transition duration-300 hover:bg-blue-600"
//              >
//                Lưu
//              </button>
//            </div>
//          </form>
//        </div>
//      </div>
     
//       )}
//     </div>
//   );
// };

// export default EmployeeList;
import React, { useEffect, useState } from 'react';
import UserService from './../../../store/adminUserStore.js';
import RoleService from './../../../store/adminRoleStore.js';
import AddEmployee from './component/AddEmployee.jsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editEmployee, setEditEmployee] = useState(null); 
  const [addEmployee, setAddEmployee] = useState(false); 

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(7);  // Hiển thị 7 nhân viên mỗi trang

  const handleOpenAddEmployee = () => {
    setAddEmployee(true); 
  };

  const handleCloseAddEmployee = () => {
    setAddEmployee(false); 
  };

  const handleAddEmployee = () => {
    fetchEmployees();  
  };

  function ConvertDate(isoDateString) {
    return new Date(isoDateString).toLocaleString('vi-VN', { hour12: false });
  }

  function arrangeList(employees) {
    return employees.sort((a, b) => a.idrole.localeCompare(b.idrole));
  }

  function changeNameRole(nameRole) {
    switch (nameRole) {
      case 'ADMIN': return 'Quản trị viên';
      case 'EMPLOYEE': return 'Nhân viên';
      case 'CUSTOMER': return 'Khách hàng';
      default: return 'Không xác định';
    }
  }

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const [employeeData, fetchedRoleData] = await Promise.all([
        UserService.getAllEmployees(),
        RoleService.getAllRoles(),
      ]);

      const updatedRoleData = fetchedRoleData.map((rd) => ({
        ...rd,
        name: changeNameRole(rd.name),
      }));

      const roleMap = new Map(updatedRoleData.map((role) => [role.id, role.name]));

      const processedEmployees = arrangeList(
        employeeData.map((emp) => ({
          ...emp,
          idrole: roleMap.get(emp.idrole) || 'Không xác định',
          created_at: ConvertDate(emp.created_at),
          updated_at: ConvertDate(emp.updated_at),
          deleted_at: emp.deleted_at ? ConvertDate(emp.deleted_at) : '-',
        }))
      );

      setEmployees(processedEmployees);
      setRoleData(updatedRoleData); 
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${emp.firstname} ${emp.lastname}`.toLowerCase().includes(searchLower) || 
      emp.phone.includes(searchTerm) || 
      emp.idrole.toLowerCase().includes(searchLower)
    );
  });

  // Xác định nhân viên hiển thị trên trang hiện tại
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  // Chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEdit = (id) => {
    const employee = employees.find(emp => emp.id === id);
    setEditEmployee(employee); 
  };

  const handleCancelEdit = () => {
    setEditEmployee(null); 
  };

  const handleSave = async (event) => {
    event.preventDefault(); 

    if (!editEmployee.firstname || !editEmployee.lastname || !editEmployee.phone) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      const matchedRole = roleData.find(role => role.name === editEmployee.idrole);
      if (matchedRole) {
        editEmployee.idrole = matchedRole.id;
      }
      await UserService.updateEmployee(editEmployee.id, editEmployee);
      alert('Thông tin nhân viên đã được cập nhật!');
      fetchEmployees(); 
      setEditEmployee(null); 
    } catch (error) {
      alert('Lỗi khi cập nhật nhân viên!');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        const Em = await UserService.getEmployeeByID(id);
        if (Em) {
          await UserService.deleteEmployee(id);
          alert(`Đã xóa nhân viên: ${Em.firstname} ${Em.lastname}`);
          fetchEmployees();
        } else {
          alert('Không tìm thấy nhân viên!');
        }
      } catch (error) {
        alert('Lỗi khi xóa nhân viên!');
      }
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm('Bạn có chắc muốn mở khóa nhân viên này?')) {
      try {
        const Em = await UserService.getEmployeeByID(id);
        if (Em) {
          await UserService.undeleteEmployee(id);
          alert(`Đã mở khóa nhân viên: ${Em.firstname} ${Em.lastname}`);
          fetchEmployees();
        } else {
          alert('Không tìm thấy nhân viên!');
        }
      } catch (error) {
        alert('Lỗi khi mở khóa nhân viên!');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        {/* Thanh tìm kiếm */}
        <div className="flex justify-between items-center mb-6">
          <input 
            type="text" 
            placeholder="Tìm kiếm nhân viên..." 
            value={searchTerm} 
            onChange={handleSearch} 
            className="p-2 border rounded-lg w-3/4"  
          />
          <button
            onClick={handleOpenAddEmployee}
            className="bg-green-500 text-white px-4 py-2 rounded-md ml-12"
          >
            Thêm nhân viên
          </button>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-200 text-gray-700 uppercase text-sm">
                  <th className="p-3 border">Tên nhân viên</th>
                  <th className="p-3 border">SĐT</th>
                  <th className="p-3 border">Vai Trò</th>
                  <th className="p-3 border">Ngày tạo</th>
                  <th className="p-3 border">Ngày chỉnh sửa</th>
                  <th className="p-3 border">Ngày xóa</th>
                  <th className="p-3 border">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.map(employee => (
                  <tr key={employee.id} className="hover:bg-gray-100 text-center border-b">
                    <td className="p-3 border">{employee.firstname} {employee.lastname}</td>
                    <td className="p-3 border">{employee.phone}</td>
                    <td className="p-3 border font-medium text-indigo-600">{employee.idrole}</td>
                    <td className="p-3 border">{employee.created_at}</td>
                    <td className="p-3 border">{employee.updated_at}</td>
                    <td className="p-3 border text-red-500">{employee.deleted_at}</td>
                    <td className="p-3 border">
                      <button onClick={() => handleEdit(employee.id)} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Sửa</button>
                      {employee.deleted_at !== '-' ? (
                        <button 
                          onClick={() => handleRestore(employee.id)} 
                          className="bg-green-500 text-white px-3 py-1 rounded"
                        >
                          Hủy
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleDelete(employee.id)} 
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phân trang */}
            <div className="flex justify-center mt-4">
              {Array.from({ length: Math.ceil(filteredEmployees.length / employeesPerPage) }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 mx-1 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {addEmployee && <AddEmployee onClose={handleCloseAddEmployee} onAddEmployee={handleAddEmployee} />}
      {/* Form Edit */}
      {editEmployee && (
       <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-10">
       <div className="bg-white p-8 rounded-xl shadow-2xl w-96 relative z-20">
         <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Chỉnh sửa thông tin</h2>
         <form onSubmit={(e) => {
           e.preventDefault();
           handleSave(editEmployee);
         }}>
           <div className="mb-6">
             <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">Họ</label>
             <input
               type="text"
               id="firstname"
               className="w-full px-4 py-2 border border-gray-300 rounded-md"
               value={editEmployee.firstname}
               onChange={(e) => setEditEmployee({ ...editEmployee, firstname: e.target.value })}
             />
           </div>
           <div className="mb-6">
             <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Tên</label>
             <input
               type="text"
               id="lastname"
               className="w-full px-4 py-2 border border-gray-300 rounded-md"
               value={editEmployee.lastname}
               onChange={(e) => setEditEmployee({ ...editEmployee, lastname: e.target.value })}
             />
           </div>
           <div className="mb-6">
             <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Số điện thoại</label>
             <input
               type="text"
               id="phone"
               className="w-full px-4 py-2 border border-gray-300 rounded-md"
               value={editEmployee.phone}
               onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
             />
           </div>
           <div className="flex justify-between">
             <button
               type="submit"
               className="px-4 py-2 bg-green-500 text-white rounded-md"
             >
               Lưu
             </button>
             <button
               type="button"
               onClick={handleCancelEdit}
               className="px-4 py-2 bg-gray-500 text-white rounded-md"
             >
               Hủy
             </button>
           </div>
         </form>
       </div>
     </div>
      )}
    </div>
  );
};

export default EmployeeList;
