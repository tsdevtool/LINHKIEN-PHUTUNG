import { useEffect, useState } from "react";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useSupplierStore } from "@/store/useSupplierStore";
import { Button } from "@/components/ui/button";

const EditCategoryForm = ({ category, onClose }) => {
  const { addOrUpdateCategory } = useCategoryStore();
  const { suppliers, getAllSuppliers, isLoadingSupplier } = useSupplierStore(); // Lấy danh sách nhà cung ứng

  useEffect(() => {
    getAllSuppliers();
  }, [getAllSuppliers]);
  const [formData, setFormData] = useState({
    name: category.name || "",
    categories: category.categories?.join(", ") || "",
    suppliers_id: category.suppliers_id || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      categories: formData.categories.split(",").map((c) => c.trim()), // Chuyển thành mảng
    };
    await addOrUpdateCategory(dataToSend, category.id);
    onClose();
  };
  console.log(suppliers);

  return (
    <div className="fixed inset-0 bg-gray-800/40 bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-bold mb-4">
          {category.id ? "Sửa danh mục" : "Thêm danh mục"}
        </h2>

        <label className="block mb-2">Tên danh mục</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 mb-4"
          placeholder="Nhập tên danh mục"
        />

        <label className="block mb-2">Loại (cách nhau bởi dấu ,)</label>
        <input
          name="categories"
          value={formData.categories}
          onChange={handleChange}
          className="w-full border p-2 mb-4"
          placeholder="VD: Thức ăn nhanh, Bánh"
        />

        <label className="block mb-2">Nhà cung ứng</label>
        <select
          name="suppliers_id"
          value={formData.suppliers_id}
          onChange={handleChange}
          className="w-full border p-2 mb-4 rounded"
        >
          {isLoadingSupplier ? (
            <option value="">Đang tải...</option>
          ) : (
            <>
              <option value="">Chọn nhà cung ứng</option>
              {suppliers?.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </>
          )}
        </select>

        <div className="flex justify-end">
          <Button onClick={onClose} className="mr-2">
            Hủy
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-500 text-white">
            {category.id ? "Lưu" : "Thêm"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryForm;
