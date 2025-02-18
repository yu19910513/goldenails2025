import http from "../common/NodeCommon";

/**
 * Service for handling payment-related API calls.
 */
class PaymentService {
    /**
     * Sends a request to create a payment.
     * 
     * @param {Object} paymentData - The payment details including amount, currency, and source ID.
     * @param {number} paymentData.amount - The payment amount in cents.
     * @param {string} paymentData.currency - The currency code (e.g., "USD").
     * @param {string} paymentData.sourceId - The Square-generated token for the payment method.
     * @returns {Promise<Object>} A promise resolving to the response from the server.
     */
    createPayment(paymentData) {
        return http.post("/payments", { paymentData });
    }
}

export default new PaymentService();
