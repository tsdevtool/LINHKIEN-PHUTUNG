import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search } from "lucide-react";
import { useProductStore } from "../../../store/useProductStore";
import toast from "react-hot-toast";

// Hàm định dạng tiền tệ
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

const ProductList = () => {
  const {
    products,
    getAllProducts,
    restockProduct,
    isLoading,
  } = useProductStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState("");

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  const handleRestockClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleRestockSubmit = async () => {
    if (!restockQuantity || restockQuantity <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    try {
      await restockProduct(selectedProduct.id, restockQuantity);
      toast.success("Nhập hàng thành công");
      setIsModalOpen(false);
      setRestockQuantity("");
      getAllProducts(); // Refresh product list
    } catch (error) {
      toast.error("Lỗi khi nhập hàng");
    }
  };

  const filteredProducts = products.filter((product) => {
    return (
      searchTerm.trim() === "" ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Danh sách tất cả sản phẩm</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      {/* Hiển thị tổng số sản phẩm */}
      <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Tổng số sản phẩm: <span className="font-medium">{filteredProducts.length}</span>
          </span>
          <span>Cập nhật: {new Date().toLocaleDateString("vi-VN")}</span>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-center">Số lượng</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Không có sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 truncate max-w-xs" title={product.name}>
                      {product.name}
                    </div>
                  </TableCell>
                  <TableCell>{product.category?.name || "Không có danh mục"}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.quantity === 0 ? "destructive" : "default"}>
                      {product.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      className="bg-green-500 text-white hover:bg-green-600" // Màu xanh lá cây
                      size="sm"
                      onClick={() => handleRestockClick(product)}
                    >
                      Nhập hàng
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nhập hàng cho sản phẩm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Sản phẩm: {selectedProduct?.name}</p>
              <Input
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(Number(e.target.value))}
                placeholder="Nhập số lượng"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="primary" onClick={handleRestockSubmit}>
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProductList;