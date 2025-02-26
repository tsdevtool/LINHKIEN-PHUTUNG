import { SupplierProduct } from "../models/supplier.model.js";

// Tạo nhà cung cấp mới
export const createSupplier = async (req, res) => {
  try {
    const { nameSupplier, phone, address } = req.body;
    if (!nameSupplier || !phone || !address) {
      return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin nhà cung cấp" });
    }

    const newSupplier = new SupplierProduct({ nameSupplier, phone, address });
    await newSupplier.save();
    res.status(201).json({ success: true, supplier: newSupplier });
  } catch (error) {
    console.log("Error in createSupplier controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy danh sách nhà cung cấp
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await SupplierProduct.find();
    res.status(200).json({ success: true, suppliers });
  } catch (error) {
    console.log("Error in getSuppliers controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy nhà cung cấp theo ID
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await SupplierProduct.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp" });
    }
    res.status(200).json({ success: true, supplier });
  } catch (error) {
    console.log("Error in getSupplierById controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Cập nhật nhà cung cấp
export const updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await SupplierProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSupplier) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp" });
    }
    res.status(200).json({ success: true, supplier: updatedSupplier });
  } catch (error) {
    console.log("Error in updateSupplier controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Xóa nhà cung cấp
export const deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await SupplierProduct.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp" });
    }
    res.status(200).json({ success: true, message: "Xóa nhà cung cấp thành công" });
  } catch (error) {
    console.log("Error in deleteSupplier controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
