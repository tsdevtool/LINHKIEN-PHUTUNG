import { Bell, Menu, Search } from "lucide-react";
import React from "react";


const Header = () => {
  return (
    <nav className="flex items-center justify-between bg-white p-4 shadow-md">
    

      {/* Middle - Search Bar */}
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 w-96">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm (Ctrl + K)"
          className="outline-none ml-2 w-full"
        />
      </div>

      {/* Right Side - Notifications & Profile */}
      <div className="flex items-center gap-4">
        <Bell className="text-gray-600 text-lg cursor-pointer" />
        <div className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1 cursor-pointer">
          <span className="bg-green-500 w-8 h-8 flex items-center justify-center text-white rounded-full">
            FI
          </span>
          <span className="text-gray-700">Admin Flex home</span>
        </div>
      </div>
    </nav>
  );
};

export default Header;
