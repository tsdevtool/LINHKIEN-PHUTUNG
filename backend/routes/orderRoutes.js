import express from 'express';
// import authMiddleware from '../middleware/authMiddleware.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

// Apply auth middleware to all routes
// router.use(authMiddleware); // khi nào có auth thì dùng

// Get all orders
router.get('/', orderController.getOrders);

// Create new order
router.post('/', orderController.createOrder);

// Get order by ID
router.get('/:id', orderController.getOrder);

// Update order
router.put('/:id', orderController.updateOrder);

// Cancel order
router.put('/:id/cancel', orderController.cancelOrder);

export default router; 