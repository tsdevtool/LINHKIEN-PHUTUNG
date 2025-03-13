import { useState, useEffect } from 'react';
import customerService from '../services/customerService';

export const useCustomer = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await customerService.getCustomers();
            console.log('Fetched customers:', data);
            setCustomers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query) => {
        try {
            setLoading(true);
            setError(null);
            const results = await customerService.searchCustomers(query);
            console.log('Search results from API:', results);
            setCustomers(results);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectCustomer = (customer) => {
        console.log('Raw customer data:', customer);
        
        // Kiểm tra và chuẩn hóa dữ liệu khách hàng
        const normalizedCustomer = {
            _id: customer._id || customer.id, // Thử cả _id và id
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            address: customer.address || ''
        };

        console.log('Normalized customer data:', normalizedCustomer);

        if (!normalizedCustomer._id) {
            console.error('Customer missing ID:', customer);
            setError('Thiếu thông tin ID khách hàng');
            return;
        }

        if (!normalizedCustomer.address) {
            console.error('Customer missing address:', customer);
            setError('Thiếu thông tin địa chỉ khách hàng');
            return;
        }

        setSelectedCustomer(normalizedCustomer);
        setIsSearchActive(false);
        setSearchTerm('');
    };

    const clearSelectedCustomer = () => {
        setSelectedCustomer(null);
        setSearchTerm('');
    };

    return {
        customers,
        selectedCustomer,
        searchTerm,
        isSearchActive,
        loading,
        error,
        setSearchTerm,
        setIsSearchActive,
        handleSearch,
        selectCustomer,
        clearSelectedCustomer
    };
}; 