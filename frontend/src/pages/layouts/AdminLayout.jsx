import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { cn } from "@/lib/utils";
import { useState } from "react";

const AdminLayout = ({ children, breadcrumbItems }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const sidebarWidth =
    isSidebarOpen || isLocked
      ? "ml-64 w-[calc(100%-16rem)]"
      : "ml-16 w-[calc(100%-4rem)]";
  return (
    <div className="flex">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
      />
      <Header isSidebarOpen={isSidebarOpen || isLocked} />
      <main
        className={cn("p-6 mt-16 transition-all duration-300", sidebarWidth)}
      >
        <div className="mb-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
