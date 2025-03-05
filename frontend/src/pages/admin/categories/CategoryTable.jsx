import { useCategoryStore } from "@/store/useCategoryStore";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { BadgePlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupplierStore } from "@/store/useSupplierStore";
import EditCategoryForm from "./EditCategoryForm";
import CategoryTableSkeleton from "./skeletons/CategoryTableSkeleton";

const CategoryTable = () => {
  const { categories, isLoading, getAllCategories, deleteCategory } =
    useCategoryStore();

  const { suppliers, getAllSuppliers, isLoadingSupplier } = useSupplierStore();
  const [editingCategory, setEditingCategory] = useState(null);
  useEffect(() => {
    getAllCategories();
    getAllSuppliers();
  }, [getAllCategories, getAllSuppliers]);

  if ((isLoading, isLoadingSupplier)) {
    <CategoryTableSkeleton />;
  }
  return (
    <div>
      <Button
        onClick={() => setEditingCategory({})}
        className="mb-4 hover:outline cursor-pointer"
      >
        <BadgePlus size={32} /> Thêm danh mục
      </Button>
      <Table>
        <TableCaption>Danh sách danh mục sản phẩm</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Tên danh mục</TableHead>
            <TableHead>Thể loại</TableHead>
            <TableHead>Nhà cung ứng</TableHead>
            <TableHead className="text-right">Ngày tạo</TableHead>
            <TableHead className={"text-center"}>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <TableRow key={category.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.categories.join(", ")}</TableCell>
              <TableCell>
                {suppliers.find((s) => s.id === category.suppliers_id)?.name ||
                  "Không xác định"}
              </TableCell>
              <TableCell className="text-right">
                {new Date(category.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className={"text-center"}>
                <Button
                  onClick={() => setEditingCategory(category)}
                  className="mr-2"
                >
                  <Pencil />
                  Sửa
                </Button>
                <Button
                  onClick={() => deleteCategory(category.id)}
                  className="bg-red-500 text-white"
                >
                  <Trash2 />
                  Xoá
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Tổng số danh mục</TableCell>
            <TableCell className="text-right">{categories.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      {editingCategory !== null && (
        <EditCategoryForm
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
};

export default CategoryTable;
