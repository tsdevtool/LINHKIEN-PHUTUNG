import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import NotFound from "./pages/404/NotFound";
import CartPage from "./pages/cart/CartPage";
import AuthPage from "./pages/auth/AuthPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import Footer from "./components/Footer";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/cart" element={<CartPage />} /> {/* Thêm route cho CartPage */}
        <Route path="/*" element={<NotFound />} />
        {/* <CartProvider>
      <ProductList />
      <CartPage />
    </CartProvider> */}
      </Routes>
      <Footer />
    </>
  );
}

export default App;
