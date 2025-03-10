import React from "react";
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
import { BadgePlus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryTable = () => {
  const { categories, isLoading, getAllCategories, softDeleteCategory } =
    useCategoryStore();
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý danh mục</h2>
        <Button>
          <BadgePlus className="w-5 h-5 mr-2" />
          Thêm danh mục
        </Button>
      </div>

      <Table>
        <TableCaption>Danh sách danh mục sản phẩm</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Tên danh mục</TableHead>
            <TableHead>Số danh mục con</TableHead>
            <TableHead className="text-center">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category, index) => (
            <React.Fragment key={category.id}>
              {/* Parent Category Row */}
              <TableRow className="hover:bg-muted/50 cursor-pointer">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 hover:bg-transparent"
                      onClick={() => toggleExpand(category.id)}
                    >
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedCategories[category.id] ? "rotate-90" : ""
                        }`}
                      />
                    </Button>
                    <span className="font-medium">{category.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {category.categories?.length || 0} danh mục
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Bạn có chắc chắn muốn xóa danh mục này?"
                          )
                        ) {
                          softDeleteCategory(category.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              {/* Sub Categories */}
              {expandedCategories[category.id] &&
                category.categories?.map((subCategory) => (
                  <TableRow key={subCategory.id} className="bg-muted/30">
                    <TableCell></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 ml-6">
                        <span>{subCategory.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {category.name}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Danh mục con</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="w-4 h-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Bạn có chắc chắn muốn xóa danh mục này?"
                              )
                            ) {
                              softDeleteCategory(subCategory.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Tổng số danh mục</TableCell>
            <TableCell className="text-center">
              {categories.reduce(
                (total, cat) => total + 1 + (cat.categories?.length || 0),
                0
              )}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default CategoryTable;
