import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle } from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';

const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const OutOfStockProducts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { products = [], isLoading, getAllProducts } = useProductStore();

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  // Lọc sản phẩm có số lượng = 0 và theo từ khóa tìm kiếm
  const outOfStockProducts = products?.filter(product => {
    if (!product) return false;
    
    const isOutOfStock = product.quantity === 0;
    const matchesSearch = searchTerm.trim() === '' || 
      (product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return isOutOfStock && matchesSearch;
  }) || [];

  const handleProductClick = (productId) => {
    navigate(`/admin/products/${productId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h1 className="text-xl font-semibold">Sản phẩm hết hàng</h1>
          <Badge variant="destructive" className="ml-2">
            {outOfStockProducts.length}
          </Badge>
        </div>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã SKU</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-center">Số lượng</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outOfStockProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  Không có sản phẩm hết hàng
                </TableCell>
              </TableRow>
            ) : (
              outOfStockProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.category?.name || 'Chưa phân loại'}</TableCell>
                  <TableCell className="text-right">{formatPrice(product.price)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="destructive">0</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleProductClick(product._id)}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OutOfStockProducts; 