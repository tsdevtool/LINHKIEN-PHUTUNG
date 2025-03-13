import Header from "@/components/employee/Header";
import Navbar from "@/components/employee/Navbar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils";
import { useState } from "react";
import PropTypes from "prop-types";

const EmployeeLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const sidebarWidth =
    isSidebarOpen || isLocked
      ? "ml-64 w-[calc(100%-16rem)]"
      : "ml-16 w-[calc(100%-4rem)]";

  // Breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const path = window.location.pathname;
    const items = [{ label: "Employee", link: "/employee" }];

    if (path.includes("/neworder")) {
      items.push({ label: "Tạo đơn hàng", link: "/employee/neworder" });
    }


    return items;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
      />
      <div className={cn("flex-1 transition-all duration-300", sidebarWidth)}>
        <Header isSidebarOpen={isSidebarOpen || isLocked} />
        <main className="p-6 mt-16">
          <div className="mb-4">
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

EmployeeLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default EmployeeLayout;
