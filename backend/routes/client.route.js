import express from "express";
import {
    getProductList,
    getProductById,
    getChildCategories,
    getProductListByCategoryId,
   
   
} from "../controllers/client/clientController.js";

const router = express.Router();

router.get('/list', getProductList);
router.get('/:id', getProductById);
router.get('/parent/:parentCategoryId', getChildCategories);
router.get('/products/:categoryId', getProductListByCategoryId);

export default router;
