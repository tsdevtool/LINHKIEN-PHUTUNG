import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import NotFound from "./pages/404/NotFound";
import CartPage from "./pages/cart/CartPage";
import AuthPage from "./pages/auth/AuthPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authUser";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import OrderPage from "./pages/employee/OrderPage";
import NewOrder from "./components/employee/NewOrder";
import MainLayout from "./pages/employee/layouts/MainLayout";
function App() {
  const { user, isCheckingAuth, authCheck } = useAuthStore();
  useEffect(() => {
    authCheck();
  }, [authCheck]);
  if (isCheckingAuth) {
    return (
      <div className="h-screen">
        <div className="flex justify-center items-start bg-black h-full">
          <Loader className="animate-spin text-cyan-600 size-10" />
        </div>
      </div>
    );
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to="/" />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
        <Route path="/cart" element={<CartPage />} /> {/* Thêm route cho CartPage */}
        <Route path="/*" element={<NotFound />} />
           {/* Gói tất cả trang của employee vào MainLayout */}
        <Route path="/employee" element={<MainLayout />}>
          <Route index element={<OrderPage />} /> {/* Trang mặc định */}
          <Route path="neworder" element={<NewOrder />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
