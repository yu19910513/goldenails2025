import Service from "./service";


class NotificationService extends Service{

    /**
     * Sends a notification to a customer and/or business owner via SMS and/or email.
     *
     * @param {Object} messageData - The message details for the notification.
     * @param {string} messageData.recipient_name - The customer's full name.
     * @param {string} messageData.recipient_phone - The customer's phone number for SMS notifications.
     * @param {string} [messageData.recipient_email_address] - Optional email address for the customer.
     * @param {string} [messageData.recipient_email_subject] - Optional subject for the email sent to the customer.
     * @param {string} [messageData.recipient_optInSMS="true"] - Whether the customer opted in for SMS (default: "true").
     * @param {string} messageData.action - The action type ("confirm" or "cancel").
     * @param {string} messageData.appointment_date - The date of the appointment (YYYY-MM-DD format).
     * @param {string} messageData.appointment_start_time - The start time of the appointment.
     * @param {string} [messageData.appointment_end_time] - Optional end time of the appointment.
     * @param {string} messageData.appointment_services - The services the customer booked.
     * @param {string} [messageData.appointment_technician] - Optional assigned technician.
     * @param {string} [messageData.owner_email_subject] - Optional subject for the email sent to the business owner.
     * @returns {Promise} HTTP response promise.
     */
    notify(messageData) {
        return this.http.post(`/notification/notify`, { messageData: messageData });
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
        return this.http.post(`/notification/contact`, { email_object: email_object });
    }

}

export default new NotificationService();
