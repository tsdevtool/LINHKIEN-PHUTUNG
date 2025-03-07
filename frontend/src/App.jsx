// Core React and Third-party imports
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Store/State Management
import { useAuthStore } from "./store/authUser";

// Layouts
import AdminLayout from "./pages/layouts/AdminLayout";
import MainLayout from "./pages/employee/layouts/MainLayout";

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
import NewOrder from "./components/employee/NewOrder";

// UI Components
import Loading from "./components/ui/Loading";
import Footer from "./components/Footer";
import CategoryTest from "./components/CategoryTest";
import CategoryTree from "./components/CategoryTree";

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
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/orders" element={<OrderStatusPage />} />
        <Route path="/test" element={<CategoryTree />} />

        {/* Employee routes */}
        <Route path="/employee" element={<MainLayout />}>
          <Route index element={<OrderPage />} />
          <Route path="neworder" element={<NewOrder />} />
        </Route>

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
