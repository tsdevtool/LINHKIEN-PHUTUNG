import axios from 'axios';

const PHP_API_URL = 'http://localhost:8000/api';

class CustomerRepository {
    async getAllCustomers() {
        try {
            const response = await axios.get(`${PHP_API_URL}/users/customers`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    async getActiveCustomers() {
        try {
            const response = await axios.get(`${PHP_API_URL}/users/customers/active`);
            return response.data;
        } catch (error) {
            console.error('Error fetching active customers:', error);
            throw error;
        }
    }

    async getInactiveCustomers() {
        try {
            const response = await axios.get(`${PHP_API_URL}/users/customers/inactive`);
            return response.data;
        } catch (error) {
            console.error('Error fetching inactive customers:', error);
            throw error;
        }
    }

    async searchCustomers(searchTerm) {
        try {
            const response = await axios.post(`${PHP_API_URL}/users/customers/search`, { searchTerm });
            return response.data;
        } catch (error) {
            console.error('Error searching customers:', error);
            throw error;
        }
    }

    async getCustomerById(id) {
        try {
            const response = await axios.get(`${PHP_API_URL}/users/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    }

    async getCustomerRoleId() {
        try {
            const response = await axios.get(`${PHP_API_URL}/roles/customer`);
            return response.data.roleId;
        } catch (error) {
            console.error('Error getting customer role ID:', error);
            throw error;
        }
    }

    async createCustomer(customerData) {
        try {
            const response = await axios.post(`${PHP_API_URL}/users/customers`, customerData);
            return response.data;
        } catch (error) {
            console.error('Error creating customer:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    async updateCustomer(id, customerData) {
        try {
            const response = await axios.put(`${PHP_API_URL}/users/customers/${id}`, customerData);
            return response.data;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    async deleteCustomer(id) {
        try {
            const response = await axios.delete(`${PHP_API_URL}/users/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }

    async updateCustomerStatus(id, type) {
        try {
            const response = await axios.put(`${PHP_API_URL}/users/customers/status/${id}/${type}`);
            return response.data;
        } catch (error) {
            console.error('Error updating customer status:', error);
            throw error;
        }
    }
}

export default new CustomerRepository(); 