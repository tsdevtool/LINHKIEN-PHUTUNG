import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authUser";
import { useEffect, useState } from "react";
import Loading from "../ui/Loading";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, authCheck } = useAuthStore();
  const [isChecking, setIsChecking] = useState(false);
  const token = localStorage.getItem('token');
  const jwt = document.cookie.includes('jwt-phutung');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isChecking && (token || jwt) && !user) {
        setIsChecking(true);
        await authCheck();
        setIsChecking(false);
      }
    };
    checkAuth();
  }, [token, jwt, user, authCheck, isChecking]);

  // Nếu không có token hoặc cookie, redirect về login
  if (!token && !jwt) {
    return <Navigate to="/auth/login" replace />;
  }

  // Nếu đã có user data, kiểm tra role và render
  if (user) {
    if (!hasAllowedRole(user, allowedRoles)) {
      return <Navigate to="/unauthorized" replace />;
    }
    return children;
  }

  // Hiển thị loading trong khi chờ authCheck
  if (isChecking) {
    return <Loading />;
  }

  // Nếu không có user và không đang check, cho phép retry
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className="text-gray-600 mb-4">Không thể xác thực. Vui lòng thử lại.</p>
      <button
        onClick={() => setIsChecking(false)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Thử lại
      </button>
    </div>
  );
};

// Helper function to check role
const hasAllowedRole = (user, allowedRoles) => {
  if (!user?.role?.name) return false;
  return allowedRoles.includes(user.role.name.toLowerCase());
};

export default ProtectedRoute; 