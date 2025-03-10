import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Home,
  List,
  Menu,
  Package,
  User2,
  Users,
  EllipsisVertical,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import MenuItem from "./MenuItem";

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
  {
    name: "Danh mục",
    icon: <List />,
    link: "#",
    subItems: [
      { name: "Danh sách", link: "/admin/categories" },
      { name: "Sơ đồ", link: "/admin/categories-tree" },
    ],
  },
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
  const location = useLocation();

  return (
    <div
      className={cn(
        "h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out fixed z-50",
        "border-r border-gray-800",
        isOpen || isLocked ? "w-64" : "w-20"
      )}
      onMouseEnter={() => !isLocked && setIsOpen(true)}
      onMouseLeave={() => !isLocked && setIsOpen(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-800">
        <img src="/logo-nobg.png" alt="Logo" className="w-10 h-10 rounded-lg" />
        {(isOpen || isLocked) && (
          <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            MotorKing
          </h1>
        )}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={cn(
            "ml-auto p-2 rounded-lg transition-all duration-300",
            "hover:bg-gray-800 hover:text-blue-400",
            isLocked && "text-blue-400"
          )}
        >
          {isLocked ? (
            <Menu className="w-5 h-5" />
          ) : (
            <EllipsisVertical className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="space-y-2 p-4">
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            item={item}
            isOpen={isOpen}
            isLocked={isLocked}
            isActive={
              location.pathname === item.link ||
              (item.subItems &&
                item.subItems.some((sub) => location.pathname === sub.link))
            }
          />
        ))}
      </nav>
    </div>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  isLocked: PropTypes.bool.isRequired,
  setIsLocked: PropTypes.func.isRequired,
};

export default Sidebar;
