import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useProductStore } from "@/store/useProductStore";
import { useEffect, useState } from "react";

const EditProductForm = ({ initialProduct, isOpen, setIsOpen }) => {
  const { updateProduct, getAllProducts } = useProductStore();
  const { categories, getAllCategories } = useCategoryStore();

  const [product, setProduct] = useState(initialProduct);

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "image") {
      setProduct({ ...product, image: files[0] });
    } else if (name === "images") {
      setProduct({ ...product, images: Array.from(files) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("description", product.description);
    formData.append("quantity", parseInt(product.quantity, 10)); // Ensure quantity is an integer
    formData.append("price", parseFloat(product.price)); // Ensure price is a float
    formData.append("category_id", product.category_id);
  
    if (product.image instanceof File) {
      formData.append("image", product.image);
    }
  
    if (product.images?.length > 0) {
      product.images.forEach((image) => {
        if (image instanceof File) {
          formData.append("images[]", image);
        }
      });
    }
  
    console.log("Kiểu dữ liệu của quantity:", typeof parseInt(product.quantity, 10)); // Should log "number"
    console.log("Kiểu dữ liệu của price:", typeof parseFloat(product.price)); // Should log "number"
  
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? "[File]" : value);
    }
  
    try {
      await updateProduct(product.id, formData);
      await getAllProducts();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <Label htmlFor="name">Tên sản phẩm</Label>
        <Input
          id="name"
          name="name"
          value={product.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          name="description"
          value={product.description}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Số lượng</Label>
          <Input
            id="quantity"
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Giá</Label>
          <Input
            id="price"
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="category_id">Danh mục</Label>
        <Select
          value={product.category_id}
          onValueChange={(value) =>
            setProduct({ ...product, category_id: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn danh mục" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="image">Hình ảnh</Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <Label htmlFor="images">Hình ảnh phụ</Label>
        <Input
          id="images"
          name="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
      </div>
      <div className="flex justify-between">
        <Button type="submit" className="bg-green-500 text-white">
          Cập nhật sản phẩm
        </Button>
        <Button
          type="button"
          onClick={() => setIsOpen(false)}
          className="bg-red-500 text-white"
        >
          Hủy
        </Button>
      </div>
    </form>
  );
};

export default EditProductForm;