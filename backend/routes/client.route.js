import express from "express";
import {
    getProductList,
    getDetailProduct,
    // getProductListByParent,
    getProductListByChild,
} from "../controllers/Customer/client.controller.js";

const router = express.Router();

router.get('/products/list', getProductList);
router.get('/products/:id/detail-product',getDetailProduct);
router.get('/products/:categoryId/category', getProductListByChild);
// router.get('/products/:parentId', getProductListByParent);

export default router;