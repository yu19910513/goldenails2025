import http from "../common/NodeCommon";

/**
 * A service class for managing miscellaneous items or data.
 */
class MiscellaneousService {

  /**
   * Retrieves a miscellaneous item by its title.
   * 
   * @param {string} title - The title of the miscellaneous item to fetch.
   * @returns {Promise<Object>} A promise resolving to the fetched miscellaneous item data.
   */
  find(title) {
    return http.get(`/miscellaneouses/${title}/`);
  }

  /**
 * Sends an SMS appointment confirmation message to the customer and/or owner.
 * 
 * @function
 * @param {Object} messageData - The data required to send the SMS.
 * @param {string} messageData.customer_number - The customer's phone number to send the message to.
 * @param {string} messageData.customer_message - The SMS content for the customer.
 * @param {string} [messageData.owner_message] - The optional SMS content for the owner.
 * 
 * @returns {Promise<Object>} A promise that resolves to the HTTP response if the SMS is sent successfully.
 * @throws {Error} Throws an error if the HTTP request fails.
 * 
 * @example
 * const messageData = {
 *   customer_number: "1234567890",
 *   customer_message: "Your appointment is confirmed for January 25th at 3:00 PM.",
 *   owner_message: "Appointment confirmed for customer John Doe."
 * };
 * 
 * smsAppointmentConfirmation(messageData)
 *   .then(response => console.log("SMS sent successfully:", response))
 *   .catch(error => console.error("Error sending SMS:", error));
 */
  smsAppointmentConfirmation(messageData) {
    return http.post(`/miscellaneouses/sms_appointment_confirmation`, { messageData: messageData });
  }
}

export default new MiscellaneousService();
