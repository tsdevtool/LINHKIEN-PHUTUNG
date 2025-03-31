import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authUser";
import Loading from "../ui/Loading";

const hasAllowedRole = (user, allowedRoles) => {
  if (!user?.role?.name) return false;
  const userRole = user.role.name.toLowerCase();
  return allowedRoles.includes(userRole);
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  // Nếu đang trong quá trình check auth ở App.jsx, user sẽ là null
  if (user === null) {
    return <Loading />;
  }

  // Nếu không có user (đã check xong nhưng không có user)
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!hasAllowedRole(user, allowedRoles)) {
    console.log('ProtectedRoute - User does not have required role:', {
      userRole: user.role?.name,
      allowedRoles
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
