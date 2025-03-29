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
  ChevronDown,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useState } from "react";
import { Link } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: <Home />, link: "/employee" },
  {
    name: "Đơn hàng",
    icon: <ClipboardList />,
    link: "#",
    subItems: [
      { name: "Tạo Đơn Hàng", link: "/employee/orders/new" },
      { name: "Danh sách đơn hàng", link: "/employee/orders" },
      { name: "", link: "/admin/orders/completed" },
    ],
  },
  
  
];

const MenuItem = ({ item, isOpen, isLocked, isActive }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  return (
    <div>
      {item.subItems ? (
        <div className="relative">
          <button
            onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
            className={cn(
              "w-full flex items-center p-3 rounded-lg transition-all duration-300",
              "hover:bg-gray-800",
              isActive && "bg-gray-800 text-blue-400"
            )}
          >
            <span className="text-xl">{item.icon}</span>
            {(isOpen || isLocked) && (
              <>
                <span className="ml-3 flex-1 text-left">{item.name}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isSubMenuOpen && "transform rotate-180"
                  )}
                />
              </>
            )}
          </button>
          {(isOpen || isLocked) && isSubMenuOpen && (
            <div className="pl-12 space-y-2 mt-2">
              {item.subItems.map((subItem, index) => (
                <Link
                  key={index}
                  to={subItem.link}
                  className={cn(
                    "block p-2 rounded-lg transition-all duration-300",
                    "hover:bg-gray-800 hover:text-blue-400",
                    location.pathname === subItem.link && "text-blue-400"
                  )}
                >
                  {subItem.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Link
          to={item.link}
          className={cn(
            "flex items-center p-3 rounded-lg transition-all duration-300",
            "hover:bg-gray-800",
            isActive && "bg-gray-800 text-blue-400"
          )}
        >
          <span className="text-xl">{item.icon}</span>
          {(isOpen || isLocked) && (
            <span className="ml-3">{item.name}</span>
          )}
        </Link>
      )}
    </div>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    link: PropTypes.string.isRequired,
    subItems: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        link: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  isOpen: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  isActive: PropTypes.bool.isRequired,
};

const Navbar = ({ isOpen, setIsOpen, isLocked, setIsLocked }) => {
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

Navbar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  isLocked: PropTypes.bool.isRequired,
  setIsLocked: PropTypes.func.isRequired,
};

export default Navbar;
