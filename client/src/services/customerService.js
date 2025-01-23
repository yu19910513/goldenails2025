import http from "../common/NodeCommon";

/**
 * A service class for managing customer-related operations.
 */
class CustomerService {
  /**
   * Retrieves a customer by their phone number.
   * 
   * @param {string} phoneNumber - The phone number of the customer to search for.
   * @returns {Promise<Object>} A promise resolving to the customer data, or an empty response if not found.
   */
  getOneByPhoneNumber(phoneNumber) {
    return http.get(`/customers/search?phone=${phoneNumber}`);
  }

  /**
   * Validates a customer using their phone number and name.
   * 
   * @param {string} phoneNumber - The customer's phone number.
   * @param {string} enteredName - The name entered for validation.
   * @returns {Promise<Object>} A promise resolving to the validated customer data, or an error if validation fails.
   */
  validateUsingNumberAndName(phoneNumber, enteredName) {
    return http.get(`/customers/validate?phone=${phoneNumber}&name=${enteredName}`);
  }

  /**
   * Creates a new customer record.
   * 
   * @param {Object} customerData - The data for the new customer.
   * @param {string} customerData.name - The customer's name.
   * @param {string} customerData.phone - The customer's phone number.
   * @param {string} [customerData.email] - The customer's email address (optional).
   * @returns {Promise<Object>} A promise resolving to the created customer data.
   */
  createCustomer(customerData) {
    return http.post(`/customers/`, customerData);
  }
}

export default new CustomerService();
