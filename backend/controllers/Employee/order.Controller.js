import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import mongoose from 'mongoose';
import moment from 'moment';
import payosService from '../../services/payosService.js';

// Get all orders
export const getOrders = async (req, res) => {
    try {
        // Get sorting and filtering parameters
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        const status = req.query.status;
        const paymentStatus = req.query.paymentStatus;
        const shippingStatus = req.query.shippingStatus;
        const dateRange = req.query.dateRange;

        // Build query
        let query = {};

        // Apply status filters
        if (status) {
            query.status = status;
        }
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }
        if (shippingStatus) {
            query.shippingStatus = shippingStatus;
        }

        // Apply date range filter
        if (dateRange) {
            const now = moment();
            switch (dateRange) {
                case 'today':
                    query.createdAt = {
                        $gte: moment().startOf('day'),
                        $lte: moment().endOf('day')
                    };
                    break;
                case 'week':
                    query.createdAt = {
                        $gte: moment().subtract(7, 'days').startOf('day')
                    };
                    break;
                case 'month':
                    query.createdAt = {
                        $gte: moment().subtract(30, 'days').startOf('day')
                    };
                    break;
            }
        }

        // Build sort object
        let sort = {};
        if (sortBy.includes('.')) {
            // Handle nested fields (e.g., 'staffInfo.name')
            const [parent, child] = sortBy.split('.');
            sort[parent + '.' + child] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }

        // Execute query with sorting
        const orders = await Order.find(query)
            .sort(sort)
            .lean(); // Use lean() for better performance

        // Transform data for response
        const transformedOrders = orders.map(order => ({
            ...order,
            _id: order._id.toString(),
            customerId: order.customerId?.toString(),
            items: order.items.map(item => ({
                ...item,
                productId: item.productId.toString()
            }))
        }));

        res.status(200).json({
            success: true,
            orders: transformedOrders,
            total: transformedOrders.length,
            filters: {
                status,
                paymentStatus,
                shippingStatus,
                dateRange
            },
            sorting: {
                field: sortBy,
                order: sortOrder
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
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
                paymentMethod, shippingMethod, staffId, staffInfo,
                paymentStatus, shippingStatus, status } = req.body;

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
        
        // Kiểm tra sản phẩm và số lượng tồn kho
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Không tìm thấy sản phẩm với ID: ${item.productId}`);
            }
            if (product.quantity < item.quantity) {
                throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.quantity} trong kho`);
            }
        }

        // Create order with status values from frontend
        const order = new Order({
            order_number: orderNumber,
            customerId,
            customerInfo,
            items,
            totalAmount,
            finalTotal,
            paymentMethod,
            paymentStatus,
            shippingMethod,
            shippingStatus,
            status,
            staffId,
            staffInfo
        });

        await order.save({ session });

        // Update product quantities
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { quantity: -item.quantity } },
                { session }
            );
        }

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

// Tạo payment link cho đơn hàng
export const createPaymentLink = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã được thanh toán'
            });
        }

        console.log('Creating payment for order:', order);
        const paymentResult = await payosService.createPayment(order);
        console.log('Payment result:', paymentResult);
        
        // Cập nhật order với thông tin thanh toán
        order.paymentInfo = {
            provider: 'PayOS',
            paymentId: paymentResult.paymentLinkId,
            status: 'pending'
        };
        await order.save();

        res.status(200).json({
            success: true,
            paymentUrl: paymentResult.checkoutUrl,
            paymentId: paymentResult.paymentLinkId
        });

    } catch (error) {
        console.error('Payment link creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi khi tạo link thanh toán'
        });
    }
};

// Xử lý webhook từ PayOS
export const paymentWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-payos-signature'];
        const payload = req.body;

        console.log('Received webhook data:', payload);
        console.log('Received signature:', signature);

        // Verify signature
        const isValid = payosService.verifyWebhookSignature(payload, signature);
        if (!isValid) {
            console.error('Invalid webhook signature');
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        console.log('Signature verified successfully');

        // Tìm đơn hàng theo orderReference
        const order = await Order.findOne({ 
            $or: [
                { order_number: payload.orderReference },
                { "paymentInfo.paymentId": payload.paymentLinkId }
            ]
        });

        if (!order) {
            console.error('Order not found:', payload.orderReference);
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        console.log('Found order:', order);

        // Cập nhật trạng thái thanh toán nếu status là PAID
        if (payload.status === 'PAID') {
            console.log('Processing PAID status for order:', order.order_number);
            
            try {
                // Cập nhật trạng thái thanh toán
                order.paymentStatus = 'paid';
                
                // Cập nhật thông tin thanh toán
                order.paymentInfo = {
                    ...order.paymentInfo,
                    provider: 'PayOS',
                    status: 'paid',
                    transactionId: payload.transactionId,
                    paidAt: new Date(payload.orderInfo?.paymentAt || Date.now()),
                    amount: payload.amount
                };

                // Cập nhật trạng thái đơn hàng
                if (order.shippingMethod === 'Nhận tại cửa hàng') {
                    // Nếu nhận tại cửa hàng và đã thanh toán -> hoàn thành
                    order.status = 'completed';
                } else if (order.status === 'pending') {
                    // Nếu đang chờ xử lý -> chuyển sang đã xác nhận
                    order.status = 'confirmed';
                }

                await order.save();
                console.log('Order updated successfully:', {
                    orderNumber: order.order_number,
                    paymentStatus: order.paymentStatus,
                    status: order.status,
                    paymentInfo: order.paymentInfo
                });
            } catch (saveError) {
                console.error('Error saving order:', saveError);
                throw saveError;
            }
        } else {
            console.log('Payment status is not PAID:', payload.status);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};  