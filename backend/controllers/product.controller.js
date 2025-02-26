import { Product } from "../models/product.model.js";
import { CategoryProduct } from "../models/category.model.js";

// Tạo sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const { nameProduct, descriptionProduct, quantityProduct, category, HSD, money } = req.body;
    if (!nameProduct || !descriptionProduct || !quantityProduct || !category || !HSD || !money) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin sản phẩm" });
    }

    // Kiểm tra danh mục có tồn tại không
    let categoryData = await CategoryProduct.findById(category);
    if (!categoryData) {
      return res.status(400).json({ success: false, message: "Danh mục không hợp lệ" });
    }

    const newProduct = new Product({ nameProduct, descriptionProduct, quantityProduct, category, HSD, money });
    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.log("Error in createProduct controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy danh sách sản phẩm
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.log("Error in getProducts controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.log("Error in getProductById controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    if (req.body.category) {
      let categoryData = await CategoryProduct.findById(req.body.category);
      if (!categoryData) {
        return res.status(400).json({ success: false, message: "Danh mục không hợp lệ" });
      }
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("category");
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log("Error in updateProduct controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
