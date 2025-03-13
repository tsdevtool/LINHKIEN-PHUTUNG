import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

class CustomerRepository {
    async getAllCustomers() {
        try {
            const response = await axios.get(`${API_URL}/customers`);
            return response.data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    async searchCustomers(query) {
        try {
            const response = await axios.get(`${API_URL}/customers/search?q=${query}`);
            return response.data.customers || [];
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    }

    async getCustomerById(id) {
        try {
            const response = await axios.get(`${API_URL}/customers/${id}`);
            return response.data.customer;
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    }

    async createCustomer(customerData) {
        try {
            const response = await axios.post(`${API_URL}/customers`, customerData);
            return response.data.customer;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }
}

export default new CustomerRepository(); 