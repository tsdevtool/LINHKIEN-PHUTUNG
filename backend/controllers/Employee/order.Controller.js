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
        const payment_status = req.query.paymentStatus;
        const shipping_status = req.query.shippingStatus;
        const dateRange = req.query.dateRange;

        // Build query
        let query = {};

        // Apply status filters
        if (status) {
            query.status = status;
        }
        if (payment_status) {
            query.payment_status = payment_status;
        }
        if (shipping_status) {
            query.shipping_status = shipping_status;
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

        // Transform data for response with safe checks
        const transformedOrders = orders.map(order => {
            const transformedOrder = {
                ...order,
                _id: order._id?.toString() || null
            };

            // Safely transform items if they exist
            if (Array.isArray(order.items)) {
                transformedOrder.items = order.items.map(item => ({
                    ...item,
                    product_id: item.product_id?.toString() || null
                }));
            } else {
                transformedOrder.items = [];
            }

            return transformedOrder;
        });

        res.status(200).json({
            success: true,
            orders: transformedOrders,
            total: transformedOrders.length,
            filters: {
                status,
                payment_status,
                shipping_status,
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
        console.log('Received order data:', JSON.stringify(req.body, null, 2));
        
        // Data is already in snake_case from frontend
        const orderData = {
            customer_id: req.body.customer_id,
            customer_info: req.body.customer_info,
            items: req.body.items,
            total_amount: req.body.total_amount,
            discount: req.body.discount || 0,
            shipping_fee: req.body.shipping_fee || 0,
            finaltotal: req.body.finaltotal,
            payment_method: req.body.payment_method,
            payment_status: req.body.payment_status,
            shipping_method: req.body.shipping_method,
            shipping_status: req.body.shipping_status,
            status: req.body.status,
            staff_id: req.body.staff_id,
            staff_info: req.body.staff_info,
            note: req.body.note || ''
        };

        console.log('Processed order data:', JSON.stringify(orderData, null, 2));

        // Validate required fields
        if (!orderData.items?.length || !orderData.customer_id || 
            !orderData.customer_info?.name || !orderData.customer_info?.phone || 
            !orderData.customer_info?.address || !orderData.total_amount || 
            !orderData.finaltotal || !orderData.payment_method || 
            !orderData.shipping_method || !orderData.staff_id || 
            !orderData.staff_info?.name) {
            throw new Error('Thiếu thông tin bắt buộc');
        }

        // Tạo mã đơn hàng
        const orderNumber = await Order.generateOrderNumber();
        console.log("Generated order number:", orderNumber);
        
        // Kiểm tra sản phẩm và số lượng tồn kho
        for (const item of orderData.items) {
            const product = await Product.findById(item.product_id);
            if (!product) {
                throw new Error(`Không tìm thấy sản phẩm với ID: ${item.product_id}`);
            }
            if (product.quantity < item.quantity) {
                throw new Error(`Sản phẩm ${product.name} chỉ còn ${product.quantity} trong kho`);
            }
        }

        // Create order
        const order = new Order({
            order_number: orderNumber,
            ...orderData
        });

        await order.save({ session });

        // Update product quantities
        for (const item of orderData.items) {
            await Product.findByIdAndUpdate(
                item.product_id,
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
        const order = await Order.findById(req.params.id)
            .populate('customer_id')
            .populate('items.product_id');

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
        const { 
            customer_info, 
            items, 
            total_amount, 
            finaltotal, 
            status, 
            payment_status, 
            shipping_status, 
            note,
            confirmed_at,
            shipping_updated_at,
            delivered_at,
            cancelled_at,
            payment_info
        } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            throw new Error('Không tìm thấy đơn hàng');
        }

        // Update order with snake_case fields
        const updateData = {
            customer_info,
            items,
            total_amount,
            finaltotal,
            status: status || order.status,
            payment_status: payment_status || order.payment_status,
            shipping_status: shipping_status || order.shipping_status,
            note: note || order.note,
            confirmed_at: confirmed_at !== undefined ? confirmed_at : order.confirmed_at,
            shipping_updated_at: shipping_updated_at !== undefined ? shipping_updated_at : order.shipping_updated_at,
            delivered_at: delivered_at !== undefined ? delivered_at : order.delivered_at,
            cancelled_at: cancelled_at !== undefined ? cancelled_at : order.cancelled_at
        };

        // Cập nhật payment_info nếu có
        if (payment_info) {
            updateData.payment_info = payment_info;
        }

        console.log('Updating order with data:', updateData);

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
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
        const { cancelReason } = req.body;
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
                item.product_id,
                { $inc: { quantity: item.quantity } },
                { session }
            );
        }

        // Cập nhật trạng thái và thông tin hủy đơn
        order.status = 'cancelled';
        order.cancel_reason = cancelReason;
        order.cancelled_at = new Date();
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

        if (order.payment_status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã được thanh toán'
            });
        }

        // Lấy return_url và cancel_url từ request body
        const { return_url, cancel_url } = req.body;
        const returnOptions = {};
        
        if (return_url) returnOptions.return_url = return_url;
        if (cancel_url) returnOptions.cancel_url = cancel_url;

        console.log('Creating payment for order:', order);
        console.log('Return options:', returnOptions);
        
        const paymentResult = await payosService.createPayment(order, returnOptions);
        console.log('Payment result:', paymentResult);
        
        // Cập nhật order với thông tin thanh toán
        order.payment_info = {
            provider: 'PayOS',
            payment_id: paymentResult.paymentLinkId,
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
                { "payment_info.payment_id": payload.paymentLinkId }
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
                order.payment_status = 'paid';
                
                // Cập nhật thông tin thanh toán
                order.payment_info = {
                    ...order.payment_info,
                    provider: 'PayOS',
                    status: 'paid',
                    transaction_id: payload.transactionId,
                    paid_at: new Date(payload.orderInfo?.paymentAt || Date.now()),
                    amount: payload.amount
                };

                // Cập nhật trạng thái đơn hàng
                if (order.shipping_method === 'Nhận tại cửa hàng') {
                    // Nếu nhận tại cửa hàng và đã thanh toán -> hoàn thành
                    order.status = 'completed';
                } else if (order.status === 'pending') {
                    // Nếu đang chờ xử lý -> chuyển sang đã xác nhận
                    order.status = 'confirmed';
                }

                await order.save();
                console.log('Order updated successfully:', {
                    order_number: order.order_number,
                    payment_status: order.payment_status,
                    status: order.status,
                    payment_info: order.payment_info
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