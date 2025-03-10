import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const CreateProductForm = () => {
  const { addProduct, isLoadingProduct } = useProductStore();
  const { categories, getAllCategories } = useCategoryStore();

  const [product, setProduct] = useState({
    name: "",
    description: "",
    quantity: "",
    price: "",
    category_id: "",
    image: null,
    images: [],
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getAllCategories();
  }, [getAllCategories]);

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
    formData.append("quantity", product.quantity);
    formData.append("price", product.price);
    formData.append("category_id", product.category_id);
    if (product.image_url) {
      formData.append("image", product.image);
    }
    if (product.images.length > 0) {
      product.images.forEach((image) => {
        formData.append("images[]", image);
      });
    }

    try {
      await addProduct(formData);
      setIsOpen(false);
      setProduct({
        name: "",
        description: "",
        quantity: "",
        price: "",
        category_id: "",
        image: null,
        images: [], // Reset images array
      });
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Thêm sản phẩm</Button>
        </DialogTrigger>
        <DialogContent className="p-6 max-w-lg">
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>

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
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
            <div className="flex justify-between">
              <Button type="submit" className="bg-green-500 text-white">
                Lưu sản phẩm
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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProductForm;
