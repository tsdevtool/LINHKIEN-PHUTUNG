import ProductList from "@/components/products/ProductList";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import { useCartStore } from "../../store/Cart/useCartStore";
import SidebarLeft from "../../components/SidebarLeft";
import ScrollToTop from "../../components/ui/ScrollToTop";
import SidebarRight from "@/components/SidebarRight";
import Footer from "@/components/Footer";
const HomePage = () => {

  return (
    <div className="min-h-screen">
      <Header />
      <Navbar />
      {/* Danh sach san pham */}
      <div className="flex justify-center">
        <SidebarLeft />
        <ProductList />
        <SidebarRight />
      </div>
      <ScrollToTop />
      <Footer />
    </div>
  );
};

export default HomePage;
