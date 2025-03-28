import ProductList from "@/components/products/ProductList";
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";

import SidebarLeft from "../../components/SidebarLeft";
import ScrollToTop from "../../components/ui/ScrollToTop";
import SidebarRight from "@/components/SidebarRight";

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
    </div>
  );
};

export default HomePage;
