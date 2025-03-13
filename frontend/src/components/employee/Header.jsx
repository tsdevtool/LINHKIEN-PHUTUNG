import { Search, Bell, Mail, Layers, LogOut, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

const Header = ({ isSidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 bg-white p-4 shadow-sm z-40 transition-all duration-300",
        isSidebarOpen
          ? "ml-64 w-[calc(100%-16rem)]"
          : "ml-16 w-[calc(100%-4rem)]"
      )}
    >
      <div className="flex items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <button className="relative text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              3
            </span>
          </button>

          {/* Messages */}
          <button className="relative text-gray-500 hover:text-gray-700">
            <Mail className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              5
            </span>
          </button>

          {/* Apps */}
          <button className="text-gray-500 hover:text-gray-700">
            <Layers className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <img
                src="https://ui-avatars.com/api/?name=Employee&background=0D8ABC&color=fff"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">Nhân viên</p>
                <p className="text-xs text-gray-500">employee@motorking.com</p>
              </div>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <User className="w-4 h-4 mr-3" />
                  Thông tin cá nhân
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <LogOut className="w-4 h-4 mr-3" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
};

export default Header;
