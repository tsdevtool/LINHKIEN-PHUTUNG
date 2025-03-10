import Header from "../../components/Header";
import Navbar from "../../components/Navbar";
import ProductList from "../../components/products/ProductList";
import SidebarLeft from "../../components/SidebarLeft";
import SidebarRight from "../../components/SidebarRight";
import ScrollToTop from "../../components/ui/ScrollToTop";

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
