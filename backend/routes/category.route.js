import express from 'express';
import CategoryController from '../controllers/Admin/category.controller.js';

const router = express.Router();

router.get("/", CategoryController.index);
router.get("/trash", CategoryController.getCateDele);
router.get("/:id", CategoryController.show);
router.post("/", CategoryController.store);
router.put("/:id", CategoryController.edit);
router.delete("/:id", CategoryController.delete);
router.delete("/delete/:id", CategoryController.deleteCate);
router.put("/undelete/:id", CategoryController.undelete);


export default router;