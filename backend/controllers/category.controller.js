import { CategoryProduct } from "../models/category.model.js";
import { SupplierProduct } from "../models/supplier.model.js";

// Tạo danh mục mới
export const createCategory = async (req, res) => {
  try {
    const { nameCategory, supplier } = req.body;
    if (!nameCategory || !supplier) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin danh mục" });
    }

    // Kiểm tra nhà cung cấp có tồn tại không
    const supplierExists = await SupplierProduct.findById(supplier);
    if (!supplierExists) {
      return res.status(400).json({ success: false, message: "Nhà cung cấp không hợp lệ" });
    }

    const newCategory = new CategoryProduct({ nameCategory, supplier });
    await newCategory.save();
    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.log("Error in createCategory controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy danh sách danh mục
export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryProduct.find().populate("supplier");
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.log("Error in getCategories controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy danh mục theo ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await CategoryProduct.findById(req.params.id).populate("supplier");
    if (!category) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    console.log("Error in getCategoryById controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
  try {
    if (req.body.supplier) {
      const supplierExists = await SupplierProduct.findById(req.body.supplier);
      if (!supplierExists) {
        return res.status(400).json({ success: false, message: "Nhà cung cấp không hợp lệ" });
      }
    }

    const updatedCategory = await CategoryProduct.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("supplier");
    if (!updatedCategory) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }
    res.status(200).json({ success: true, category: updatedCategory });
  } catch (error) {
    console.log("Error in updateCategory controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Xóa danh mục
export const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await CategoryProduct.findByIdAndDelete(req.params.id);
    if (!deletedCategory) {
      return res.status(404).json({ success: false, message: "Không tìm thấy danh mục" });
    }
    res.status(200).json({ success: true, message: "Xóa danh mục thành công" });
  } catch (error) {
    console.log("Error in deleteCategory controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
