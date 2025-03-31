import { Button } from "@/components/ui/button";
import EmployeeList from "./EmployeesList";
// import CreateProductForm from "./components/CreateProductForm";
import { useState } from "react";

const EmployeesSection = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Danh sách nhân viên</h1>
        {/* <CreateProductForm /> */}
      </div>

      <EmployeeList />
    </div>
  );
};

export default EmployeesSection;
