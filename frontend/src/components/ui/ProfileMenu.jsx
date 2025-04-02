import { LayoutDashboard, LogOut, Settings, User, Package } from "lucide-react";
import { useState, useMemo } from "react";
import { useAuthStore } from "../../store/authUser";
import { Link, useNavigate } from "react-router-dom";

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Check user roles
  const userRoles = useMemo(() => {
    if (!user) return [];
    
    // Handle role from MongoDB ObjectId format
    if (user.idrole) {
      return [user.idrole];
    }
    
    // Handle role from direct role object
    if (user.role) {
      if (typeof user.role === 'string') {
        return [user.role.toLowerCase().trim()];
      }
      if (user.role._id) {
        return [user.role._id];
      }
      if (user.role.name) {
        return [user.role.name.toLowerCase().trim()];
      }
    }
    
    return [];
  }, [user]);

  // Role IDs from MongoDB
  const ROLE_IDS = {
    ADMIN: '67dac317e2b2c2309a07727f',
    EMPLOYEE: '67e35a7da530e687f14bfd2a',
    CUSTOMER: '67dac2f4e2b2c2309a07727f'
  };

  const isAdmin = userRoles.includes(ROLE_IDS.ADMIN);
  const isEmployee = userRoles.includes(ROLE_IDS.EMPLOYEE);

  const handleButton = () => {
    if (user) {
      setIsOpen(!isOpen);
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleButton}
        className="flex items-center gap-2 max-md:gap-1 bg-gray-800 text-white px-4 py-2 max-md:px-2 rounded-lg shadow-lg cursor-pointer"
      >
        {!user ? (
          <>
            <User size={20} />
            <p className="line-clamp-1 max-md:text-sm">Đăng nhập</p>
          </>
        ) : (
          <>
            {user.image ? (
              <img
                src={user.image}
                alt={user.firstname + " " + user.lastname}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <User size={20} />
            )}
            <span>{user.firstname}</span>
          </>
        )}
      </button>

      {isOpen && user && (
        <div className="absolute left-0 mt-2 w-full bg-gray-900/80 text-white rounded-lg shadow-lg z-20">
          <div className="flex flex-col gap-2 px-4 py-2">
            {isAdmin && (
              <Link className="flex gap-2 items-center text-sm" to="/admin">
                <LayoutDashboard size={20} />
                <span>Quản trị</span>
              </Link>
            )}
            {(isAdmin || isEmployee) && (
              <Link className="flex gap-2 items-center text-sm" to="/employee">
                <LayoutDashboard size={20} />
                <span>Nhân viên</span>
              </Link>
            )}
            <Link 
              to="/orders" 
              className="flex gap-2 items-center text-sm"
            >
              <Package size={20} />
              <span>Đơn hàng của tôi</span>
            </Link>
            <Link 
              to={`/setting/${user._id}`} 
              className="flex gap-2 items-center text-sm"
            >
              <Settings size={20} /> 
              <span className="truncate">Cài đặt tài khoản</span>
            </Link>
            <button
              onClick={logout}
              className="flex gap-2 items-center text-sm text-left w-full cursor-pointer"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
