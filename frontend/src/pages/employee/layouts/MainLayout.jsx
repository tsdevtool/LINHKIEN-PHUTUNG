import React from "react";
import Navbar from "../../../components/employee/Navbar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar (Navbar) */}
      <Navbar />

      {/* Nội dung chính */}
      <div className="flex-1 p-6 bg-gray-100 overflow-auto">
        <Outlet /> {/* Đây là nơi nội dung trang sẽ hiển thị */}
      </div>
    </div>
  );
};

export default MainLayout;
