import { useState, useEffect } from 'react';
import orderService from '../services/orderService';
import productService from '../services/productService';

export const useOrder = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [shippingFee, setShippingFee] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [shippingMethod, setShippingMethod] = useState('');
    const [staff, setStaff] = useState('');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Tính tổng tiền sản phẩm
    const totalProductPrice = selectedProducts.reduce(
        (sum, product) => sum + (product.price * product.quantity),
        0
    );

    // Tính tổng tiền cuối cùng
    const finalTotal = totalProductPrice - discount + shippingFee;

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        try {
            setLoading(true);
            const results = await productService.searchProducts(query);
            setProducts(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = (product, quantity = 1) => {
        console.log('Adding product:', product);
        
        // Kiểm tra dữ liệu sản phẩm
        const productId = product._id || product.id;
        if (!productId) {
            console.error('Product missing ID:', product);
            setError('Sản phẩm không có ID');
            return;
        }

        const newProduct = {
            _id: productId,
            uniqueId: Date.now().toString(),
            name: product.name,
            price: product.price,
            sku: product.sku || product.code || '',
            image_url: product.image_url || product.imageUrl || '',
            quantity: quantity
        };

        console.log('Normalized product data:', newProduct);
        
        setSelectedProducts(prevProducts => [...prevProducts, newProduct]);
        setIsSearchActive(false);
    };

    const updateProductQuantity = (uniqueId, newQuantity) => {
        if (newQuantity > 0) {
            setSelectedProducts(prevProducts =>
                prevProducts.map(product =>
                    product.uniqueId === uniqueId
                        ? { ...product, quantity: newQuantity }
                        : product
                )
            );
        }
    };

    const removeProduct = (uniqueId) => {
        setSelectedProducts(prevProducts => 
            prevProducts.filter(product => product.uniqueId !== uniqueId)
        );
    };

    const createOrder = async (orderData) => {
        try {
            setLoading(true);
            setError(null);

            console.log('Validating order data:', orderData);

            // Validate required fields
            if (!orderData || typeof orderData !== 'object') {
                throw new Error('Dữ liệu đơn hàng không hợp lệ');
            }

            if (!orderData.customerId) {
                throw new Error('Thiếu thông tin ID khách hàng');
            }

            if (!orderData.customerInfo || !orderData.customerInfo.name || !orderData.customerInfo.phone) {
                throw new Error('Thiếu thông tin khách hàng');
            }

            if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
                throw new Error('Vui lòng chọn ít nhất một sản phẩm');
            }

            if (!orderData.paymentMethod) {
                throw new Error('Vui lòng chọn phương thức thanh toán');
            }

            if (!orderData.shippingMethod) {
                throw new Error('Vui lòng chọn phương thức giao hàng');
            }

            if (!orderData.staffId) {
                throw new Error('Vui lòng chọn nhân viên phụ trách');
            }

            // Validate and set payment status
            orderData.paymentStatus = (() => {
                const status = (() => {
                    if (orderData.paymentMethod === "Đã thanh toán" || 
                        orderData.paymentMethod === "Tiền mặt" || 
                        orderData.paymentMethod === "Chuyển khoản" ||
                        orderData.paymentMethod === "Momo" ||
                        orderData.paymentMethod === "ZaloPay" ||
                        orderData.paymentMethod === "VNPay") {
                        return "paid";
                    }
                    if (orderData.paymentMethod === "Thanh toán sau" || orderData.paymentMethod === "COD") {
                        return "pending";
                    }
                    return "unpaid";
                })();
                console.log('Payment Method:', orderData.paymentMethod);
                console.log('Payment Status:', status);
                return status;
            })();

            // Validate and set shipping status
            orderData.shippingStatus = (() => {
                const status = (() => {
                    switch (orderData.shippingMethod) {
                        case "Đã giao hàng":
                            return "delivered";
                        case "Đã qua hàng vận chuyển":
                            return "shipping";
                        default:
                            return "pending";
                    }
                })();
                console.log('Shipping Method:', orderData.shippingMethod);
                console.log('Shipping Status:', status);
                return status;
            })();

            // Validate and set order status
            orderData.status = (() => {
                const status = (() => {
                    if (orderData.shippingMethod === "Đã giao hàng" && 
                        (orderData.paymentMethod === "Đã thanh toán" || 
                         orderData.paymentMethod === "Tiền mặt" || 
                         orderData.paymentMethod === "Chuyển khoản" ||
                         orderData.paymentMethod === "Momo" ||
                         orderData.paymentMethod === "ZaloPay" ||
                         orderData.paymentMethod === "VNPay")) {
                        return "completed";
                    }
                    if (orderData.shippingMethod === "Đã giao hàng") {
                        return "delivered";
                    }
                    if (orderData.shippingMethod === "Đã qua hàng vận chuyển") {
                        return "shipping";
                    }
                    return "pending";
                })();
                console.log('Order Status:', status);
                return status;
            })();

            // Ensure staffInfo has correct name
            if (orderData.staffId) {
                orderData.staffInfo = {
                    name: orderData.staffId,
                    role: 'employee'
                };
                console.log('Staff Info:', orderData.staffInfo);
            }

            console.log('Final Order Data:', {
                paymentMethod: orderData.paymentMethod,
                paymentStatus: orderData.paymentStatus,
                shippingMethod: orderData.shippingMethod,
                shippingStatus: orderData.shippingStatus,
                status: orderData.status,
                staffInfo: orderData.staffInfo
            });

            const response = await orderService.createOrder(orderData);
            console.log('Order creation response:', response);

            // Reset form
            setSelectedProducts([]);
            setShippingFee(0);
            setDiscount(0);
            setPaymentMethod('');
            setShippingMethod('');
            setStaff('');
            setNote('');

            return response;
        } catch (err) {
            console.error('Order creation error:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        products,
        selectedProducts,
        isSearchActive,
        searchTerm,
        shippingFee,
        discount,
        paymentMethod,
        shippingMethod,
        staff,
        note,
        loading,
        error,
        totalProductPrice,
        finalTotal,
        setSearchTerm,
        setIsSearchActive,
        setShippingFee,
        setDiscount,
        setPaymentMethod,
        setShippingMethod,
        setStaff,
        setNote,
        addProduct,
        updateProductQuantity,
        removeProduct,
        handleSearch,
        createOrder
    };
}; 