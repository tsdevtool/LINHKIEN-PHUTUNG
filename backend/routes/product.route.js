import express from "express";
import {createProduct, deleteProduct, getProducts, updateProduct} from "../controllers/product.controller.js";
import {createCategory, deleteCategory, getCategories, updateCategory} from "../controllers/category.controller.js";
import {createSupplier, deleteSupplier, getSuppliers, updateSupplier} from "../controllers/supplier.controller.js";
const router = express.Router();

// product
router.post("/products", createProduct);
router.get("/products", getProducts);
router.get("/products/:id", getProducts)
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
// category
router.post("/categorys", createCategory);
router.get("/categorys", getCategories);
router.get("/categorys/:id", getCategories);
router.put("/categorys/:id", updateCategory);
router.delete("/categorys/:id",deleteCategory);
//suppliers
router.post("/Suppliers", createSupplier);
router.get("/Suppliers", getSuppliers);
router.get("/Suppliers/:id", getSuppliers);
router.put("/Suppliers/:id", updateSupplier);
router.delete("/Suppliers/:id",deleteSupplier);
export default router;
