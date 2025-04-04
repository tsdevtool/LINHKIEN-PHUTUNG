// Core React and Third-party imports
import { useEffect, useState } from "react";
import { Navigate, Route, Routes} from "react-router-dom";
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
import AdminStockCheck from "./pages/admin/inventory/inventory";
import AdminConfirmationStockList from "./pages/admin/inventory/confirmationInventory";
import UsersList from "./pages/admin/users/UsersList";
//Admin Employees
import EmployeesSection from "./pages/admin/employees/EmployeesSection";
// Employee Components
import NewOrder from "./pages/employee/NewOrder";
import OrderList from "./pages/employee/OrderList";
import EditOrder from './pages/employee/EditOrder';
import OrderDetail from "./pages/employee/OrderDetail";
import PaymentSuccess from "./pages/employee/payment/PaymentSuccess";
import PaymentCancel from "./pages/employee/payment/PaymentCancel";

//Detail Product
import ProductDetail from "./pages/products/ProductDetail";

import EmployeeStockCheck from './pages/employee/inventory/inventory';

// UI Components
import Loading from "./components/ui/Loading";
import CategoriesTreeSection from "./pages/admin/categories/CategoriesTreeSection";
import ProtectedRoute from './components/auth/ProtectedRoute';
import OutOfStockProducts from "./pages/admin/products/OutOfStockProducts";
import CategoryChildProductsPage from "./pages/products/CategoryChildProductsPage";
import CategoryParentProductsPage from "./pages/products/CategoryParentProductsPage";
import ProductList from "./pages/admin/products/ProductList";

function App() {
  const { user, authCheck } = useAuthStore();
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  const reload = 5*60*60*1000;

  // Check auth chỉ 1 lần khi app khởi động
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Kiểm tra cookie trước khi gọi auth check
        const hasCookie = document.cookie.includes('jwt-phutung');
        if (!hasCookie) {
          console.log('No auth cookie found, skipping auth check');
          setIsInitialAuthCheck(false);
          return;
        }

        console.log('Auth cookie found, checking auth...');
        await authCheck();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsInitialAuthCheck(false);
      }
    };

    initAuth();
  },[reload]); // Run only once on mount

  // Hiển thị loading trong 300ms đầu để tránh flash content
  if (isInitialAuthCheck) {
    return <Loading />;
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={!user ? <AuthPage /> : <Navigate to="/" replace />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/categories_products/:id" element={<CategoryChildProductsPage />} />
        <Route path="/category/:id" element={<CategoryParentProductsPage />} />
        <Route path="/product-info/:id" element={<ProductDetail />} />
        
        {/* Payment routes - no auth required */}
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/qr" element={<PaymentQRPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrderStatusPage />} />

        {/* Protected routes */}
        <Route path="/cart" element={
          <ProtectedRoute allowedRoles={['admin', 'employee', 'customer']}>
            <CartPage />
          </ProtectedRoute>
        } />

        <Route path="/setting/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'employee', 'customer']}>
            <SettingPage />
          </ProtectedRoute>
        } />

        {/* Employee routes */}
        <Route path="/employee/*" element={
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
                <Route path="inventory" element={<EmployeeStockCheck />} />
              </Routes>
            </EmployeeLayout>
          </ProtectedRoute>
        } />

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
                  {/* <Route path="products/list" element={<ProductsSection />} /> */}
                  <Route path="products/list" element={<ProductList />} />
                  <Route path="orders" element={<OrderList />} />
                  {/* <Route path="orders/:id" element={<OrderDetail />} />
                  <Route path="orders/:id/edit" element={<EditOrder />} /> */}
                  {/* <Route path="orders/new" element={<NewOrder />} /> */}
                  <Route path="employees/info" element={<EmployeesSection />} />
                  <Route path="inventory" element={<AdminStockCheck />} />
                  <Route path="confirmation-inventory" element={<AdminConfirmationStockList />} />
                  <Route path="users" element={<UsersList />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster />
    </>
  );
}

export default App;
