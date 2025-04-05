import express from "express";
import {
    getAllEmployee, 
    searchEmployeeByName, 
    getEmployeeByID, 
    addEmployee, 
    updateEmployee ,
    deleteEmployee ,
    undeleteEmployee
} from "../controllers/Admin/user.controller.js";

const router = express.Router();

router.get('/', getAllEmployee);
router.put('/findname', searchEmployeeByName);
router.get('/:id', getEmployeeByID);
router.post('/', addEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

router.put('/undele/:id', undeleteEmployee);

export default router;
