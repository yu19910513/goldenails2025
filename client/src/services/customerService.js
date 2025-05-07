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
   * Creates a new customer or updates an existing one.
   * 
   * - If `id` is provided, updates the customer with that ID.
   * - Otherwise, looks up the customer by `phone`. If found, updates; if not, creates a new customer.
   * 
   * @param {Object} customerData - The customer data to send.
   * @param {number} [customerData.id] - Optional customer ID for direct update.
   * @param {string} customerData.name - Customer's name (required for create/update by phone).
   * @param {string} customerData.phone - Customer's phone number (required for create/update by phone).
   * @param {string} [customerData.email] - Optional email address.
   * @param {boolean} [customerData.optInSms] - Optional flag for SMS opt-in.
   * @returns {Promise<Object>} - The API response containing the created or updated customer.
   */
  upsert(customerData) {
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
