import customerRepository from '../repositories/customerRepository';

class CustomerService {
    async getCustomers() {
        return await customerRepository.getAllCustomers();
    }

    async searchCustomers(query) {
        if (!query) return [];
        return await customerRepository.searchCustomers(query);
    }

    async getCustomerById(id) {
        if (!id) throw new Error('Customer ID is required');
        return await customerRepository.getCustomerById(id);
    }

    async createCustomer(customerData) {
        this.validateCustomerData(customerData);
        return await customerRepository.createCustomer(customerData);
    }

    validateCustomerData(customerData) {
        if (!customerData.name) {
            throw new Error('Customer name is required');
        }
        if (!customerData.phone) {
            throw new Error('Customer phone number is required');
        }
        if (!customerData.address) {
            throw new Error('Customer address is required');
        }
    }
}

export default new CustomerService(); 