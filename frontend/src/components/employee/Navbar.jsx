import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Package, ChevronDown, Truck, Store, Users, Tag, DollarSign, BarChart, FileText, Settings } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="bg-[#1E293B] text-white w-64 p-4 space-y-4 h-screen">
      <h1 className="text-xl font-bold text-white">MotoKing</h1>
      <nav className="space-y-2">
        <div>
          <button
            className="flex items-center justify-between w-full p-2 hover:bg-[#374151] rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center space-x-2">
              <Package size={20} /> <span>Đơn hàng</span>
            </div>
            <ChevronDown size={18} className={isOpen ? "rotate-180 transition" : "transition"} />
          </button>
          {isOpen && (
            <div className="ml-6 space-y-1">
              <Link to="/employee/neworder" className="block p-2 text-sm hover:bg-[#374151] rounded-md text-gray-300">
                Tạo đơn hàng
              </Link>
              <Link to="#" className="block p-2 text-sm hover:bg-[#374151] rounded-md text-gray-300">
                Danh sách đơn hàng
              </Link>
            </div>
          )}
        </div>
        <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-[#374151] rounded-md">
          <Truck size={20} /> <span>Vận chuyển</span>
        </Link>
        <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-[#374151] rounded-md">
          <Store size={20} /> <span>Sản phẩm</span>
        </Link>
        <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-[#374151] rounded-md">
          <Users size={20} /> <span>Khách hàng</span>
        </Link>
        <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-[#374151] rounded-md">
          <Tag size={20} /> <span>Khuyến mãi</span>
        </Link>
        <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-[#374151] rounded-md">
          <DollarSign size={20} /> <span>Sổ quỹ</span>
        </Link>
        <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-[#374151] rounded-md">
          <BarChart size={20} /> <span>Báo cáo</span>
        </Link>
        <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-[#374151] rounded-md">
          <FileText size={20} /> <span>Sapo Invoice</span>
        </Link>
        <Link to="#" className="flex items-center space-x-2 p-2 hover:bg-[#374151] rounded-md">
          <Settings size={20} /> <span>Cấu hình</span>
        </Link>
      </nav>
    </aside>
  );
};

export default Navbar;
