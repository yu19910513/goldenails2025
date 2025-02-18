const express = require("express");
const router = express.Router();
const { createPayment } = require("../../util/payment_util");

/**
 * Handles payment creation requests.
 *
 * @route POST /
 * @param {import("express").Request} req - The request object containing payment details in the body.
 * @param {Object} req.body - The payment data.
 * @param {string} req.body.sourceId - The card nonce/token from the Square frontend SDK.
 * @param {number} req.body.amount - The payment amount in the smallest currency unit (e.g., cents).
 * @param {string} [req.body.currency="USD"] - The currency code (default is "USD").
 * @param {import("express").Response} res - The response object used to return the payment result.
 * 
 * @returns {void} - Sends a JSON response with payment details or an error message.
 *
 * @throws {Error} - Returns a 500 status with error details if payment processing fails.
 */
router.post("/", async (req, res) => {
  try {
    const response = await createPayment(req.body)
    res.json({ success: true, payment: response.result.payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.errors });
  }
});




module.exports = router;
