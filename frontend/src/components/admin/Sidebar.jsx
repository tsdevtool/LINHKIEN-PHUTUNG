import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Home,
  List,
  Menu,
  Package,
  User2,
  Users,
  ChevronDown,
  EllipsisVertical,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: <Home />, link: "/admin" },
  {
    name: "Đơn hàng",
    icon: <ClipboardList />,
    link: "#",
    subItems: [
      { name: "Chưa xác nhận", link: "/admin/orders/pending" },
      { name: "Đã xác nhận", link: "/admin/orders/confirmed" },
      { name: "Đã hoàn thành", link: "/admin/orders/completed" },
    ],
  },
  {
    name: "Sản phẩm",
    icon: <Package />,
    link: "#",
    subItems: [
      { name: "Danh sách", link: "/admin/products/list" },
      { name: "Đang được bán", link: "/admin/products/active" },
      { name: "Hết hàng", link: "/admin/products/out-of-stock" },
      { name: "Hàng tồn kho", link: "/admin/products/inventory" },
    ],
  },
  { name: "Danh mục", icon: <List />, link: "/admin/categories" },
  { name: "Người dùng", icon: <Users />, link: "/admin/users" },
  {
    name: "Nhân viên",
    icon: <User2 />,
    link: "#",
    subItems: [
      { name: "Thông tin nhân viên", link: "/admin/employees/info" },
      { name: "Lịch làm việc", link: "/admin/employees/schedule" },
    ],
  },
];

const Sidebar = ({ isOpen, setIsOpen, isLocked, setIsLocked }) => {
  return (
    <div
      className={cn(
        "h-screen bg-gray-900 text-white p-4 transition-all duration-300 ease-in-out fixed",
        isOpen || isLocked ? "w-64" : "w-16"
      )}
      onMouseEnter={() => !isLocked && setIsOpen(true)}
      onMouseLeave={() => !isLocked && setIsOpen(false)}
    >
      {/* Toggle Button */}
      <div className="flex w-full justify-between items-center">
        <img
          src="/logo-nobg.png"
          alt="Logo"
          className="size-15 overflow-hidden"
        />
        <h1 className="uppercase font-semibold text-xl overflow-hidden">
          MotorKing
        </h1>
        <button
          onClick={() => setIsLocked(!isLocked)}
          className="mb-4 p-2 transition-transform duration-300 ease-in-out hover:scale-110"
        >
          {isLocked ? <Menu /> : <EllipsisVertical />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="space-y-4">
        {menuItems.map((item, index) => (
          <div key={index}>
            <Link
              to={item.link}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-700 transition-all duration-300"
            >
              {item.icon}
              {(isOpen || isLocked) && <span>{item.name}</span>}
            </Link>
            {item.subItems && (isOpen || isLocked) && (
              <div className="ml-12 space-y-2 transition-opacity duration-300">
                {item.subItems.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.link}
                    className="block text-sm text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
