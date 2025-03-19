import express from "express";
import {
    getProductList,
    getProductById,
    getChildCategories
} from "../controllers/clientController.js";


const router = express.Router();

router.get('/list', getProductList);
router.get('/:id', getProductById);
router.get('/parent/:parentCategoryId', getChildCategories);
export default router;
