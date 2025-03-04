import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/authUser";
import { Link, useNavigate } from "react-router-dom";

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const [isAdmin] = useState(true);

  const navigate = useNavigate();

  const handleButton = () => {
    if (user) {
      setIsOpen(!isOpen);
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleButton}
        className="flex items-center gap-2 max-md:gap-1 bg-gray-800 text-white px-4 py-2 max-md:px-2 rounded-lg shadow-lg cursor-pointer "
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

          {user && (
            <div className="flex flex-col gap-2 px-4 py-2">
              {isAdmin && (
                <Link
                  className="flex gap-2 items-center text-sm"
                  to={"/dashboard"}
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </Link>
              )}
              <Link to={"/setting"} className="flex gap-2 items-center text-sm">
                <Settings size={20} /> <span className="truncate">Cài đặt</span>
              </Link>
              <Link
                className="flex gap-2 items-center text-sm"
                to={"/dashboard"}
              >
                <LayoutDashboard size={20} />
                <span>Admin</span>
              </Link>
            )}
            <Link to={"/setting"} className="flex gap-2 items-center text-sm">
              <Settings size={20} />
              <span className="truncate">Cài đặt</span>
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
