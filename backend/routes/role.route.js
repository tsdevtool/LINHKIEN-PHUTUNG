import express from "express";
import {
    addRole,
    deleteRole,
    restoreRole,
    getAllRoles,
    getAllActiveRoles,
    updateRole
} from "../controllers/Admin/role.controller.js";  

const router = express.Router();

router.post("/", addRole);
router.delete("/:id", deleteRole);
router.put("/restore/:id", restoreRole);
router.get("/", getAllRoles);
router.get("/active", getAllActiveRoles);
router.put("/:id", updateRole);

export default router;
