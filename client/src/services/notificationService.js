import http from "../common/NodeCommon";


class NotificationService {
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
    notify(messageData) {
        return http.post(`/notification/notify`, { messageData: messageData });
    }


    /**
     * Sends a message in contact form to the owner via an API call.
     *
     * @param {Object} email_object - The email details to be sent.
     * @param {string} email_object.name - The sender's name.
     * @param {string} email_object.email - The sender's email address.
     * @param {string} email_object.message - The message content.
     * @returns {Promise<Object>} A Promise resolving to the API response.
     *
     * @throws {Error} If the request fails, the API response may include an error message.
     */
    contact(email_object) {
        return http.post(`/notification/contact`, { email_object: email_object });
    }

}

export default new NotificationService();
