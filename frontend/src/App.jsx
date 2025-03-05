import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import NotFound from "./pages/404/NotFound";
import CartPage from "./pages/cart/CartPage";
import AuthPage from "./pages/auth/AuthPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authUser";
import { useEffect, useState } from "react";

import OrderPage from "./pages/employee/OrderPage";
import NewOrder from "./components/employee/NewOrder";
import MainLayout from "./pages/employee/layouts/MainLayout";
import Loading from "./components/ui/Loading";
import AdminLayout from "./pages/layouts/AdminLayout";
import DashBoardSection from "./pages/admin/dashboard/DashBoardSection";
import ProductsSection from "./pages/admin/products/ProductsSection";
import CategoriesSection from "./pages/admin/categories/CategoriesSection";
function App() {
  const { user, isCheckingAuth, authCheck } = useAuthStore();
  useEffect(() => {
    authCheck();
  }, [authCheck]);
  const [isAdmin, setIsAdmin] = useState(true);
  if (isCheckingAuth) {
    return <Loading />;
  }
  return (
    <>
      {/* {isAdmin && (
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<DashBoardSection />} />
            <Route path="/admin/products" element={<ProductsSection />} />
            <Route path="/admin/categories" element={<CategoriesSection />} />
          </Routes>
        </AdminLayout>
      )} */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/cart" element={<CartPage />} />{" "}
        {/* Thêm route cho CartPage */}
        <Route path="/*" element={<NotFound />} />
        {/* Gói tất cả trang của employee vào MainLayout */}
        <Route path="/employee" element={<MainLayout />}>
          <Route index element={<OrderPage />} /> {/* Trang mặc định */}
          <Route path="neworder" element={<NewOrder />} />
        </Route>
        <Route
          path="/admin/*"
          element={
            isAdmin ? (
              <AdminLayout>
                <Routes>
                  <Route path="" element={<DashBoardSection />} />
                  <Route path="products" element={<ProductsSection />} />
                  <Route path="categories" element={<CategoriesSection />} />
                </Routes>
              </AdminLayout>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
