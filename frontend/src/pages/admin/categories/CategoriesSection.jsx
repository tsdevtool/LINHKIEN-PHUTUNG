import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CategoryTable from "./CategoryTable";
import { useCategoryStore } from "@/store/useCategoryStore";
import AddCategoryModal from './components/AddCategoryModal';

const CategoriesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { categories, getAllCategories, addCategory, isLoading: categoryLoading } = useCategoryStore();

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  const handleSubmit = async (formData) => {
    await addCategory(formData);
    getAllCategories();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Thêm danh mục cha</span>
        </button>
      </div>

      {/* Category Table */}
      <CategoryTable categories={categories} isLoading={categoryLoading} />

      {/* Add Category Modal */}
      <AddCategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CategoriesSection;
