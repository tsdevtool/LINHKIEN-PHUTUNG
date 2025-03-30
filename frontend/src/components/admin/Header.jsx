import { Search, Bell, Mail, Layers, LogOut, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Header = ({ isSidebarOpen, isSidebarLocked }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 bg-white p-4 shadow flex items-center justify-between transition-all duration-300 z-40",
        isSidebarOpen || isSidebarLocked
          ? "ml-64 w-[calc(100%-16rem)]"
          : "ml-20 w-[calc(100%-5rem)]"
      )}
    >
      {/* Search Box */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search ..."
          className="pl-10 pr-4 py-2 w-64 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {/* Icons + User Info */}
      <div className="flex items-center space-x-6">
        {/* Mail */}
        <div className="relative">
          <Mail className="text-gray-500 cursor-pointer hover:text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            2
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Bell className="text-gray-500 cursor-pointer hover:text-gray-700" />
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            4
          </span>
        </div>

        {/* Layers */}
        <Layers className="text-gray-500 cursor-pointer hover:text-gray-700" />

        {/* User Info + Dropdown */}
        <div className="relative">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src="https://randomuser.me/api/portraits/men/1.jpg"
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
            <span className="text-gray-700 font-medium hidden sm:block">
              Hi, <span className="text-black font-semibold">Hizrian</span>
            </span>
          </div>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
              <ul className="py-2 text-gray-700">
                <li className="px-4 py-2 hover:bg-gray-100 flex items-center cursor-pointer">
                  <User className="w-4 h-4 mr-2" /> Profile
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 flex items-center cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;