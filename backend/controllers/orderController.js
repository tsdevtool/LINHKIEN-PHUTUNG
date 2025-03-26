import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import moment from 'moment';

// Get all orders
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống: ' + error.message
        });
    }
};

// Create new order
export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { items, customerId, customerInfo, totalAmount, finalTotal, 
                paymentMethod, shippingMethod, staffId, staffInfo } = req.body;

        console.log('Order data received:', JSON.stringify(req.body, null, 2));

        // Validate required fields
        if (!items || !items.length || !customerId || !customerInfo || 
            !totalAmount || !finalTotal || !paymentMethod || !shippingMethod ||
            !staffId || !staffInfo) {
            throw new Error('Thiếu thông tin bắt buộc');
        }

        // Tạo mã đơn hàng trước khi tạo đơn - sử dụng phương thức tĩnh
        const orderNumber = await Order.generateOrderNumber();
        console.log("Generated order number in controller:", orderNumber);
        
        // Kiểm tra sản phẩm - có thể bỏ qua nếu không cần kiểm tra
        /* 
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
            }
            if (product.quantity < item.quantity) {
                throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.quantity} trong kho`);
            }
        }
        */

        // Create order
        const order = new Order({
            order_number: orderNumber,  // Gán mã đơn hàng đã tạo
            customerId,
            customerInfo,
            items,
            totalAmount,
            finalTotal,
            paymentMethod,
            shippingMethod,
            staffId,
            staffInfo
        });

        await order.save({ session });

        // Skip product quantity update for now
        /*
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: -item.quantity } },
                { session }
            );
        }
        */

        await session.commitTransaction();
        
        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thành công',
            order
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Order creation error:', error);
        
        res.status(400).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng: ' + error.message,
            details: error.errors ? Object.values(error.errors).map(e => e.message) : null
        });
    } finally {
        session.endSession();
    }
};

// Get order by ID
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống: ' + error.message
        });
    }
};

// Update order
export const updateOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { customerInfo, items, totalAmount, finalTotal, 
                status, paymentStatus, shippingStatus, note } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Update order
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            {
                customerInfo,
                items,
                totalAmount,
                finalTotal,
                status: status || order.status,
                paymentStatus: paymentStatus || order.paymentStatus,
                shippingStatus: shippingStatus || order.shippingStatus,
                note: note || order.note
            },
            { new: true, session }
        );

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Cập nhật đơn hàng thành công',
            order: updatedOrder
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({
            success: false,
            message: 'Lỗi khi cập nhật đơn hàng: ' + error.message
        });
    } finally {
        session.endSession();
    }
};

// Cancel order
export const cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        if (order.status === 'cancelled') {
            throw new Error('Đơn hàng đã được hủy trước đó');
        }

        if (['completed', 'shipping'].includes(order.status)) {
            throw new Error('Không thể hủy đơn hàng ở trạng thái này');
        }

        // Return products to inventory
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: item.quantity } },
                { session }
            );
        }

        order.status = 'cancelled';
        await order.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            success: true,
            message: 'Hủy đơn hàng thành công',
            order
        });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({
            success: false,
            message: 'Lỗi khi hủy đơn hàng: ' + error.message
        });
    } finally {
        session.endSession();
    }
}; 