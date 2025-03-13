import { useState, useEffect, useCallback } from 'react';
import orderService from '../services/orderService';
import productService from '../services/productService';

// Constants
const INITIAL_STATE = {
    products: [],
    selectedProducts: [],
    isSearchActive: false,
    searchTerm: '',
    shippingFee: 0,
    discount: 0,
    paymentMethod: '',
    shippingMethod: '',
    staff: '',
    note: '',
    loading: false,
    error: null
};

const PAYMENT_METHODS = {
    PAID: "Đã thanh toán",
    CASH: "Tiền mặt",
    BANK_TRANSFER: "Chuyển khoản",
    MOMO: "Momo",
    ZALOPAY: "ZaloPay",
    VNPAY: "VNPay",
    COD: "COD",
    PAY_LATER: "Thanh toán sau"
};

const SHIPPING_METHODS = {
    DELIVERED: "Đã giao hàng",
    SHIPPING: "Đã qua hàng vận chuyển",
    PENDING: "Giao hàng sau"
};

// Validation functions
const validateOrderData = (orderData) => {
    if (!orderData || typeof orderData !== 'object') {
        throw new Error('Dữ liệu đơn hàng không hợp lệ');
    }

    const requiredFields = {
        customerId: 'ID khách hàng',
        customerInfo: 'thông tin khách hàng',
        items: 'sản phẩm',
        paymentMethod: 'phương thức thanh toán',
        shippingMethod: 'phương thức giao hàng',
        staffId: 'nhân viên phụ trách'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
        if (!orderData[field]) {
            throw new Error(`Thiếu ${label}`);
        }
    }

    if (!orderData.customerInfo.name || !orderData.customerInfo.phone) {
        throw new Error('Thiếu thông tin tên hoặc số điện thoại khách hàng');
    }

    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Vui lòng chọn ít nhất một sản phẩm');
    }
};

const validateProduct = (product) => {
    if (!product._id && !product.id) {
        throw new Error('Sản phẩm không có ID');
    }
    if (!product.name || !product.price) {
        throw new Error('Sản phẩm thiếu thông tin tên hoặc giá');
    }
};

// Status determination functions
const determinePaymentStatus = (paymentMethod) => {
    const directPaymentMethods = [
        PAYMENT_METHODS.PAID,
        PAYMENT_METHODS.CASH,
        PAYMENT_METHODS.BANK_TRANSFER,
        PAYMENT_METHODS.MOMO,
        PAYMENT_METHODS.ZALOPAY,
        PAYMENT_METHODS.VNPAY
    ];

    const pendingPaymentMethods = [
        PAYMENT_METHODS.PAY_LATER,
        PAYMENT_METHODS.COD
    ];

    if (directPaymentMethods.includes(paymentMethod)) return "paid";
    if (pendingPaymentMethods.includes(paymentMethod)) return "pending";
    return "unpaid";
};

const determineShippingStatus = (shippingMethod) => {
    switch (shippingMethod) {
        case SHIPPING_METHODS.DELIVERED:
            return "delivered";
        case SHIPPING_METHODS.SHIPPING:
            return "shipping";
        default:
            return "pending";
    }
};

const determineOrderStatus = (shippingMethod, paymentMethod) => {
    if (shippingMethod === SHIPPING_METHODS.DELIVERED && 
        determinePaymentStatus(paymentMethod) === "paid") {
        return "completed";
    }
    if (shippingMethod === SHIPPING_METHODS.DELIVERED) {
        return "delivered";
    }
    if (shippingMethod === SHIPPING_METHODS.SHIPPING) {
        return "shipping";
    }
    return "pending";
};

const normalizeProductData = (product, quantity = 1) => ({
    _id: product._id || product.id,
    uniqueId: Date.now().toString(),
    name: product.name,
    price: parseFloat(product.price),
    sku: product.sku || product.code || '',
    image_url: product.image_url || product.imageUrl || '',
    quantity: parseInt(quantity)
});

export const useOrder = () => {
    // State initialization
    const [state, setState] = useState(INITIAL_STATE);
    const {
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
        error
    } = state;

    // Computed values
    const totalProductPrice = selectedProducts.reduce(
        (sum, product) => sum + (product.price * product.quantity),
        0
    );

    const finalTotal = totalProductPrice - discount + shippingFee;

    // Update state utility
    const updateState = useCallback((newState) => {
        setState(prev => ({ ...prev, ...newState }));
    }, []);

    // Error handling utility
    const handleError = useCallback((error, customMessage = '') => {
        console.error(customMessage || 'Error:', error);
        updateState({ 
            error: error.message || 'Đã xảy ra lỗi, vui lòng thử lại',
            loading: false 
        });
    }, [updateState]);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        try {
            updateState({ loading: true, error: null });
            const data = await productService.getProducts();
            updateState({ products: data });
        } catch (error) {
            handleError(error, 'Error fetching products:');
        } finally {
            updateState({ loading: false });
        }
    }, [updateState, handleError]);

    // Initial fetch
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Search products
    const handleSearch = useCallback(async (query) => {
        if (!query?.trim()) {
            await fetchProducts();
            return;
        }

        try {
            updateState({ loading: true, error: null });
            const results = await productService.searchProducts(query);
            updateState({ products: results });
        } catch (error) {
            handleError(error, 'Error searching products:');
        } finally {
            updateState({ loading: false });
        }
    }, [fetchProducts, updateState, handleError]);

    // Add product
    const addProduct = useCallback((product, quantity = 1) => {
        try {
            validateProduct(product);
            const normalizedProduct = normalizeProductData(product, quantity);
            updateState({
                selectedProducts: [...state.selectedProducts, normalizedProduct],
                isSearchActive: false,
                error: null
            });
        } catch (error) {
            handleError(error, 'Error adding product:');
        }
    }, [state.selectedProducts, updateState, handleError]);

    // Update product quantity
    const updateProductQuantity = useCallback((uniqueId, newQuantity) => {
        if (newQuantity <= 0) {
            handleError(new Error('Số lượng phải lớn hơn 0'));
            return;
        }

        updateState({
            selectedProducts: state.selectedProducts.map(product =>
                product.uniqueId === uniqueId
                    ? { ...product, quantity: newQuantity }
                    : product
            )
        });
    }, [state.selectedProducts, updateState, handleError]);

    // Remove product
    const removeProduct = useCallback((uniqueId) => {
        updateState({
            selectedProducts: state.selectedProducts.filter(
                product => product.uniqueId !== uniqueId
            )
        });
    }, [state.selectedProducts, updateState]);

    // Create order
    const createOrder = useCallback(async (orderData) => {
        try {
            updateState({ loading: true, error: null });

            // Validate order data
            validateOrderData(orderData);

            // Set statuses
            orderData.paymentStatus = determinePaymentStatus(orderData.paymentMethod);
            orderData.shippingStatus = determineShippingStatus(orderData.shippingMethod);
            orderData.status = determineOrderStatus(orderData.shippingMethod, orderData.paymentMethod);

            // Set staff info
            if (orderData.staffId) {
                orderData.staffInfo = {
                    name: orderData.staffId,
                    role: 'employee'
                };
            }

            console.log('Creating order with data:', orderData);
            const response = await orderService.createOrder(orderData);

            // Reset form
            updateState({
                selectedProducts: [],
                shippingFee: 0,
                discount: 0,
                paymentMethod: '',
                shippingMethod: '',
                staff: '',
                note: '',
                error: null
            });

            return response;
        } catch (error) {
            handleError(error, 'Error creating order:');
            throw error;
        } finally {
            updateState({ loading: false });
        }
    }, [updateState, handleError]);

    // Field setters
    const setters = {
        setSearchTerm: useCallback((term) => updateState({ searchTerm: term }), [updateState]),
        setIsSearchActive: useCallback((active) => updateState({ isSearchActive: active }), [updateState]),
        setShippingFee: useCallback((fee) => updateState({ shippingFee: parseFloat(fee) || 0 }), [updateState]),
        setDiscount: useCallback((value) => updateState({ discount: parseFloat(value) || 0 }), [updateState]),
        setPaymentMethod: useCallback((method) => updateState({ paymentMethod: method }), [updateState]),
        setShippingMethod: useCallback((method) => updateState({ shippingMethod: method }), [updateState]),
        setStaff: useCallback((value) => updateState({ staff: value }), [updateState]),
        setNote: useCallback((value) => updateState({ note: value }), [updateState])
    };

    return {
        // State
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

        // Actions
        ...setters,
        addProduct,
        updateProductQuantity,
        removeProduct,
        handleSearch,
        createOrder,

        // Constants
        PAYMENT_METHODS,
        SHIPPING_METHODS
    };
}; 