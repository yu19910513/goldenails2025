const { Client, Environment } = require("square");
const dotenv = require('dotenv');
dotenv.config();


/**
 * Creates a payment using Square API.
 *
 * @param {Object} paymentData - The payment details.
 * @param {string} paymentData.sourceId - The card nonce/token from the Square frontend SDK.
 * @param {number} paymentData.amount - The payment amount in the smallest currency unit (e.g., cents).
 * @param {string} [paymentData.currency="USD"] - The currency code (default is "USD").
 * @returns {Promise<Object>} - A promise resolving to the Square API payment response.
 *
 * @throws {Error} - Throws an error if the payment request fails.
 */
const createPayment = (paymentData) => {
    const squareClient = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN,
        environment: Environment.Sandbox, // Change to Environment.Production for live transactions
    });
    const paymentsApi = squareClient.paymentsApi;
    return paymentsApi.createPayment({
        sourceId: paymentData.sourceId, // Card nonce/token from Square frontend SDK
        idempotencyKey: crypto.randomUUID(), // Ensure idempotency
        amountMoney: {
            amount: paymentData.amount, // Amount in the smallest currency unit (e.g., cents)
            currency: paymentData.currency || "USD",
        },
    });
};

module.exports = {createPayment};