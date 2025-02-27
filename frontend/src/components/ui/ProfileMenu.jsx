import { LogOut, Settings, User } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../../store/authUser";
import { Link, useNavigate } from "react-router-dom";

export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
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
        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg cursor-pointer"
      >
        {!user ? (
          <>
            <User size={20} />
            Đăng nhập
          </>
        ) : (
          <>
            <img src={user.image} alt={user.firstname + user.lastname} />
            {user.firstname}
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full bg-gray-900/80 text-white rounded-lg shadow-lg z-20">
          {user && (
            <div className="flex flex-col gap-2 px-4 py-2">
              <Link to={"/setting"} className="flex gap-2 items-center">
                <Settings size={20} /> <span>Cài đặt</span>
              </Link>
              <Link className="flex gap-2 items-center" onClick={logout}>
                <LogOut size={20} /> <span>Đăng xuất</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
