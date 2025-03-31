import mongoose from 'mongoose';
import { Product } from "../../models/product.model.js"; 
import { Category } from "../../models/category.model.js";
// Hàm lấy danh sách sản phẩm
export const getProductList = async (req, res) => {
  try {
    const products = await Product.find();  // Lấy tất cả sản phẩm từ DB

    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found" });
    }

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching product list:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};
// Ham chi tiet san phamm
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;  // Lấy ID sản phẩm từ URL
    const product = await Product.findById(productId);  // Tìm sản phẩm trong DB

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product by ID:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// Hàm lấy danh sách danh mục con theo danh mục cha
export const getChildCategories = async (req, res) => {
  try {
    const parentCategoryId = req.params.parentCategoryId;  // Lấy ID của danh mục cha từ URL

    // Kiểm tra nếu parentCategoryId có tồn tại
    if (!parentCategoryId) {
      return res.status(400).json({ success: false, message: "Parent category ID is required" });
    }

    // Tìm tất cả danh mục con thuộc về danh mục cha theo parent_id hoặc path
    const childCategories = await Category.find({
      $or: [
        { parent_id: parentCategoryId }, // Kiểm tra parent_id
        { path: { $regex: `^${parentCategoryId}` } } // Kiểm tra path bắt đầu bằng parentCategoryId
      ]
    });

    // Nếu không tìm thấy danh mục con
    if (!childCategories || childCategories.length === 0) {
      return res.status(404).json({ success: false, message: "No child categories found" });
    }

    // Trả về danh sách danh mục con
    return res.status(200).json({ success: true, data: childCategories });
  } catch (error) {
    console.error("Error fetching child categories by parent:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


//Hàm lấy danh sách danh mục sản phẩm theo danh mục cha
export const getProductListByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.categoryId; // Lấy category_id từ URL
    console.log("Category ID received:", categoryId);

    // Kiểm tra categoryId có hợp lệ không
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    // Chuyển categoryId thành ObjectId
    const categoryIdObject = new mongoose.Types.ObjectId(categoryId);
    console.log("Converted ObjectId:", categoryIdObject);

    // Lấy tất cả sản phẩm
    const products = await Product.find(); 
    console.log("All products fetched:", products);

    // Lọc các sản phẩm theo category_id
    const filteredProducts = products.filter(product => {
      return product.category_id.toString() === categoryIdObject.toString();
    });
    console.log("Filtered products:", filteredProducts);

    // Nếu không tìm thấy sản phẩm phù hợp
    if (!filteredProducts || filteredProducts.length === 0) {
      return res.status(404).json({ success: false, message: "No products found for this category" });
    }

    // Trả về sản phẩm đã lọc
    return res.status(200).json({ success: true, data: filteredProducts });
  } catch (error) {
    console.error("Error fetching products by category ID:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

