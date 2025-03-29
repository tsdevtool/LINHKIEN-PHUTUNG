import express from 'express';
// import authMiddleware from '../middleware/authMiddleware.js';
import * as orderController from '../controllers/Employee/order.Controller.js';

const router = express.Router();

// // Apply auth middleware to all routes
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

// Payment routes
router.post('/:orderId/payment', orderController.createPaymentLink);
router.post('/payment/webhook', orderController.paymentWebhook);

// Test webhook route - chỉ dùng trong development
if (process.env.NODE_ENV === 'development') {
    router.post('/payment/test-webhook', (req, res) => {
        const testPayload = {
            orderCode: req.body.orderCode,
            status: 'PAID',
            amount: req.body.amount || 100000,
            description: 'Test webhook payment',
            transactionId: 'TEST_' + Date.now()
        };

        // Tạo signature giả lập
        const signData = Object.keys(testPayload)
            .sort()
            .map(key => `${key}=${testPayload[key]}`)
            .join('&');
        
        const crypto = require('crypto');
        const signature = crypto
            .createHmac('sha256', process.env.PAYOS_CHECKSUM_KEY)
            .update(signData)
            .digest('hex');

        // Gọi webhook handler với payload test
        req.headers['x-payos-signature'] = signature;
        req.body = testPayload;
        
        return orderController.paymentWebhook(req, res);
    });
}

export default router; 