// Core React and Third-party imports
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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

// Admin Components
import DashBoardSection from "./pages/admin/dashboard/DashBoardSection";
import ProductsSection from "./pages/admin/products/ProductsSection";
import CategoriesSection from "./pages/admin/categories/CategoriesSection";

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

function App() {
  const { user, isCheckingAuth, authCheck } = useAuthStore();

  useEffect(() => {
    authCheck();
  }, [authCheck]);

  // Using a constant instead of state since setIsAdmin is never used
  const isAdmin = true;

  if (isCheckingAuth) {
    return <Loading />;
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/qr" element={<PaymentQRPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrderStatusPage />} />

        {/* Employee routes */}
        <Route
          path="/employee/*"
          element={
            <EmployeeLayout>
              <Routes>
                <Route path="" element={<OrderList />} />
                <Route path="orders" element={<OrderList />} />
                <Route path="orders/new" element={<NewOrder />} />
                <Route path="orders/:id" element={<OrderDetail />} />
                <Route path="orders/:id/edit" element={<EditOrder />} />
              </Routes>
            </EmployeeLayout>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            isAdmin ? (
              <AdminLayout>
                <Routes>
                  <Route path="" element={<DashBoardSection />} />
                  <Route path="products" element={<ProductsSection />} />
                  <Route path="categories" element={<CategoriesSection />} />
                  <Route
                    path="categories-tree"
                    element={<CategoriesTreeSection />}
                  />
                  <Route path="products/list" element={<ProductsSection />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <Toaster />
    </>
  );
}

export default App;
