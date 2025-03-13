import { useState, useEffect } from 'react';
import orderService from '../services/orderService';

export const useOrder = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [shippingFee, setShippingFee] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Hình thức thanh toán");
    const [shippingMethod, setShippingMethod] = useState("Giao hàng sau");
    const [staff, setStaff] = useState("");
    const [customer, setCustomer] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await orderService.getProducts();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = (product) => {
        setSelectedProducts((prev) => [...prev, product]);
        setIsSearchActive(false);
    };

    const removeProduct = (index) => {
        setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSearch = async (query) => {
        try {
            setLoading(true);
            const results = await orderService.searchProducts(query);
            setProducts(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createOrder = async () => {
        try {
            setLoading(true);
            const orderData = {
                products: selectedProducts,
                customer,
                staff,
                note,
                paymentMethod,
                shippingMethod,
                shippingFee,
                discount
            };
            
            const result = await orderService.createOrder(orderData);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const totalProductPrice = selectedProducts.reduce((sum, product) => sum + product.price, 0);
    const finalTotal = totalProductPrice - discount + shippingFee;

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
        customer,
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
        setCustomer,
        setNote,
        addProduct,
        removeProduct,
        handleSearch,
        createOrder
    };
}; 