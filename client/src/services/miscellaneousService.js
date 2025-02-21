import http from "../common/NodeCommon";

/**
 * A service class for managing miscellaneous items or data.
 */
class MiscellaneousService {

  /**
 * Fetches miscellaneous data based on the provided title.
 * 
 * This method sends a GET request to retrieve miscellaneous data from the server,
 * using the provided title as a query parameter. It expects the response to contain
 * the matching data or an error message if not found.
 * 
 * @param {string} title - The title of the miscellaneous data to search for.
 * @returns {Promise<Object>} A promise that resolves to the response from the server,
 * which will contain the miscellaneous data or an error message.
 * 
 * @example
 * // Example of how to use the `find` method
 * find("Sample Title")
 *   .then(response => {
 *     console.log(response.data); // Handles the response data
 *   })
 *   .catch(error => {
 *     console.error(error); // Handles errors
 *   });
 */
  find(title) {
    return http.get(`/miscellaneouses/key?title=${title}`);
  }

  /**
  * Sends a notification to a customer via SMS and/or email.
  * 
  * @param {Object} messageData - The message details for notification.
  * @param {string} messageData.customer_number - The customer's phone number.
  * @param {string} messageData.customer_message - The message to send to the customer.
  * @param {string} [messageData.owner_message] - Optional message for the owner.
  * @param {string} [messageData.customer_email] - Optional email for the customer.
  * @param {string} [messageData.optInSMS] - Whether the customer opted in for SMS.
  * @returns {Promise} HTTP response promise.
  */
  notifyCustomer(messageData) {
    return http.post(`/miscellaneouses/notify_customer`, { messageData: messageData });
  }


  /**
   * Sends a contact request to the owner via an API call.
   *
   * @param {Object} email_object - The email details to be sent.
   * @param {string} email_object.name - The sender's name.
   * @param {string} email_object.email - The sender's email address.
   * @param {string} email_object.message - The message content.
   * @returns {Promise<Object>} A Promise resolving to the API response.
   *
   * @throws {Error} If the request fails, the API response may include an error message.
   */
  contactOwner(email_object) {
    return http.post(`/miscellaneouses/contact_owner`, { email_object: email_object });
  }




}

export default new MiscellaneousService();
