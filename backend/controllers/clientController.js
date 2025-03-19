import { Product } from "../models/product.model.js"; 
import { Category } from "../models/category.model.js";
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
// Ham lay danh sach san pham theo id
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

// // Hàm lấy danh sách danh mục con theo danh mục cha
// export const getChildCategories = async (req, res) => {
//   try {
//     const parentCategoryId = req.params.parentCategoryId;  // Lấy ID của danh mục cha từ URL

//     // Tìm tất cả danh mục con thuộc về danh mục cha
//     const childCategories = await Category.find({ parent_id: parentCategoryId });

//     if (!childCategories || childCategories.length === 0) {
//       return res.status(404).json({ success: false, message: "No child categories found" });
//     }

//     // Trả về danh sách danh mục con
//     return res.status(200).json({ success: true, data: childCategories });
//   } catch (error) {
//     console.error("Error fetching child categories by parent:", error.message);
//     return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
//   }
// };
// // Hàm lấy danh sách sản phẩm theo danh mục cha
// export const getProductsByParentCategory = async (req, res) => {
//   try {
//     const parentCategoryId = req.params.parentCategoryId;  // Lấy ID của danh mục cha từ URL

//     // Tìm danh mục con thuộc về danh mục cha
//     const childCategories = await Category.find({ parent_id: parentCategoryId });

//     // Nếu không tìm thấy danh mục con
//     if (!childCategories || childCategories.length === 0) {
//       return res.status(404).json({ success: false, message: "No child categories found" });
//     }

//     // Lấy tất cả sản phẩm thuộc các danh mục con
//     const products = await Product.find({
//       category_id: { $in: childCategories.map(category => category._id) }
//     });

//     if (!products || products.length === 0) {
//       return res.status(404).json({ success: false, message: "No products found in these categories" });
//     }

//     // Trả về danh sách sản phẩm
//     return res.status(200).json({ success: true, data: products });
//   } catch (error) {
//     console.error("Error fetching products by parent category:", error.message);
//     return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
//   }
// };