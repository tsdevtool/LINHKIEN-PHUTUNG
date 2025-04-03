import { useState, useEffect, useCallback } from 'react';
import customerService from '../services/customerService';

// Constants
const INITIAL_STATE = {
    customers: [],
    selectedCustomer: null,
    searchTerm: '',
    isSearchActive: false,
    loading: false,
    error: null
};

// Validation functions
const validateCustomerId = (customer) => {
    const id = customer._id || customer.id;
    if (!id) {
        throw new Error('Thiếu thông tin ID khách hàng');
    }
    return id;
};

const validateCustomerData = (customer) => {
    const requiredFields = ['name', 'phone'];
    const missingFields = requiredFields.filter(field => !customer[field]);
    
    if (missingFields.length > 0) {
        throw new Error(`Thiếu thông tin khách hàng: ${missingFields.join(', ')}`);
    }
};

const normalizeCustomerData = (customer) => {
    return {
        _id: customer._id || customer.id,
        name: customer.name?.trim(),
        phone: customer.phone?.trim(),
        email: customer.email?.trim() || '',
        address: customer.address?.trim() || '',
        numberOfOrders: customer.numberOfOrders || 0,
        totalSpent: customer.totalSpent || 0,
        createdAt: customer.createdAt || new Date().toISOString()
    };
};

export const useCustomer = () => {
    // State initialization
    const [state, setState] = useState(INITIAL_STATE);
    const { customers, selectedCustomer, searchTerm, isSearchActive, loading, error } = state;

    // Update state utility
    const updateState = (newState) => {
        setState(prev => ({ ...prev, ...newState }));
    };

    // Error handling utility
    const handleError = useCallback((error, customMessage = '') => {
       
        updateState({ 
            error: error.message || 'Đã xảy ra lỗi, vui lòng thử lại',
            loading: false 
        });
    }, []);

    // Fetch customers
    const fetchCustomers = useCallback(async () => {
        try {
            updateState({ loading: true, error: null });
            const data = await customerService.getCustomers();
         
            // Ensure data is an array
            const customersArray = Array.isArray(data) ? data : (data?.customers || []);
            updateState({ customers: customersArray });
        } catch (error) {
            handleError(error, 'Error fetching customers:');
            updateState({ customers: [] }); // Set empty array on error
        } finally {
            updateState({ loading: false });
        }
    }, [handleError]);

    // Initial fetch
    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Search customers
    const handleSearch = useCallback(async (query) => {
        updateState({ loading: true, error: null });
        
        try {
            let results;
            if (!query?.trim()) {
                results = await customerService.getCustomers();
            } else {
                results = await customerService.searchCustomers(query);
            }
            
            
            // Ensure results is an array
            const resultsArray = Array.isArray(results) ? results : (results?.customers || []);
            updateState({ customers: resultsArray });
        } catch (error) {
            handleError(error, 'Error searching customers:');
            updateState({ customers: [] }); // Set empty array on error
        } finally {
            updateState({ loading: false });
        }
    }, [handleError]);

    // Select customer
    const selectCustomer = useCallback((customer) => {
        try {
           
            
            // Validate customer data
            validateCustomerId(customer);
            validateCustomerData(customer);
            
            // Normalize customer data
            const normalizedCustomer = normalizeCustomerData(customer);
         
            
            updateState({
                selectedCustomer: normalizedCustomer,
                isSearchActive: false,
                searchTerm: '',
                error: null
            });
        } catch (error) {
            handleError(error, 'Error selecting customer:');
        }
    }, [handleError]);

    // Clear selected customer
    const clearSelectedCustomer = useCallback(() => {
        updateState({
            selectedCustomer: null,
            searchTerm: '',
            error: null
        });
    }, []);

    // Set search term
    const setSearchTerm = useCallback((term) => {
        updateState({ searchTerm: term });
    }, []);

    // Set search active
    const setIsSearchActive = useCallback((active) => {
        updateState({ isSearchActive: active });
    }, []);

    // Refresh customers
    const refreshCustomers = useCallback(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    return {
        // State
        customers,
        selectedCustomer,
        searchTerm,
        isSearchActive,
        loading,
        error,

        // Actions
        setSearchTerm,
        setIsSearchActive,
        handleSearch,
        selectCustomer,
        clearSelectedCustomer,
        refreshCustomers
    };
}; 