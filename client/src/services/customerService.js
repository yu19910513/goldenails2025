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

  /**
 * Updates customer information in the database.
 * 
 * @param {Object} customerData - The customer data to update.
 * @param {string} customerData.id - The unique identifier of the customer.
 * @param {string} [customerData.name] - The updated name of the customer.
 * @param {string} [customerData.phone] - The updated phone number of the customer.
 * @param {string} [customerData.email] - The updated email address of the customer.
 * @param {boolean} [customerData.optInSms] - Indicates if the customer opts into SMS notifications.
 * @returns {Promise} - A promise resolving with the server response.
 */
  updateCustomer(customerData) {
    return http.put(`/customers/`, customerData);
  }

  /**
   * Fetches customers matching the provided keyword by name, phone, or email.
   *
   * @function smart_search
   * @param {string} keyword - The search keyword to filter customers.
   * @returns {Promise<AxiosResponse<Object[]>>} A promise resolving to a list of matching customer objects.
   *
   * @example
   * smart_search("john").then(response => {
   *   console.log(response.data); // [{ id, name, phone, email }, ...]
   * });
   */
  smart_search(keyword) {
    return http.get(`/customers/smart_search?keyword=${keyword}`)
  }

}

export default new CustomerService();
