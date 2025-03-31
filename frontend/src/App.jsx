// Core React and Third-party imports
import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Store/State Management
import { useAuthStore } from "./store/authUser";

// Layouts
import AdminLayout from "./pages/layouts/AdminLayout";
import EmployeeLayout from "./pages/layouts/EmployeeLayout";

// Pages
import HomePage from "./pages/home/HomePage";
import AuthPage from "./pages/auth/AuthPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import CartPage from "./pages/cart/CartPage";
import PaymentPage from "./pages/payment/PaymentPage";
import PaymentQRPage from "./pages/payment/PaymentQRPage";
import OrderSuccessPage from "./pages/order/OrderSuccessPage";
import OrderStatusPage from "./pages/order/OrderStatusPage";
import NotFound from "./pages/404/NotFound";
import UnauthorizedPage from "./pages/401/UnauthorizedPage";
import SettingPage from "./pages/setting/SettingPage";

// Admin Components
import DashBoardSection from "./pages/admin/dashboard/DashBoardSection";
import ProductsSection from "./pages/admin/products/ProductsSection";
import CategoriesSection from "./pages/admin/categories/CategoriesSection";
//Admin Employees
import EmployeesSection from "./pages/admin/employees/EmployeesSection";
// Employee Components
import OrderPage from "./pages/employee/OrderPage";
import NewOrder from "./pages/employee/NewOrder";
import OrderList from "./pages/employee/OrderList";
import EditOrder from './pages/employee/EditOrder';
import OrderDetail from "./pages/employee/OrderDetail";
import PaymentSuccess from "./pages/employee/payment/PaymentSuccess";
import PaymentCancel from "./pages/employee/payment/PaymentCancel";

// UI Components
import Loading from "./components/ui/Loading";
import Footer from "./components/Footer";
import CategoriesTreeSection from "./pages/admin/categories/CategoriesTreeSection";
import ProtectedRoute from './components/auth/ProtectedRoute';
import OutOfStockProducts from "./pages/admin/products/OutOfStockProducts";

function App() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect on initial login
    if (user && location.pathname === '/auth/login') {
      const role = user.role?.name?.toLowerCase() || '';
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'employee') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, location.pathname]);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
    
        <Route
          path="/auth/login"
          element={!user ? <AuthPage /> : <Navigate to="/" replace />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/qr" element={<PaymentQRPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrderStatusPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Protected Setting Route */}
        <Route
          path="/setting/:id"
          element={
            <ProtectedRoute allowedRoles={['admin', 'employee', 'customer']}>
              <SettingPage />
            </ProtectedRoute>
          }
        />

        {/* Employee routes */}
        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRoles={['admin', 'employee']}>
              <EmployeeLayout>
                <Routes>
                  <Route index element={<OrderList />} />
                  <Route path="orders">
                    <Route index element={<OrderList />} />
                    <Route path="new" element={<NewOrder />} />
                    <Route path=":id" element={<OrderDetail />} />
                    <Route path=":id/edit" element={<EditOrder />} />
                  </Route>
                </Routes>
              </EmployeeLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route index element={<DashBoardSection />} />
                  <Route path="products" element={<ProductsSection />} />
                  <Route path="products/out-of-stock" element={<OutOfStockProducts />} />
                  <Route path="categories" element={<CategoriesSection />} />
                  <Route path="categories-tree" element={<CategoriesTreeSection />} />
                  <Route path="products/list" element={<ProductsSection />} />
                  <Route path="orders"index element={<OrderList />} />
                  <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="orders/:id/edit" element={<EditOrder />} />
                  <Route path="orders/new" element={<NewOrder />} />
                  <Route path="employees/info" element={<EmployeesSection />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
      <Footer />
      <Toaster />
    </>
  );
}

export default App;
