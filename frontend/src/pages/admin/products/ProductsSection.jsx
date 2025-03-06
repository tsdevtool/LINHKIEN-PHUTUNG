import { Button } from "@/components/ui/button";
import ProductList from "./ProductList";
import CreateProductForm from "./components/CreateProductForm";
import { useState } from "react";

const ProductsSection = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Danh sách sản phẩm</h1>
        <CreateProductForm />
      </div>

      <ProductList />
    </div>
  );
};

export default ProductsSection;
