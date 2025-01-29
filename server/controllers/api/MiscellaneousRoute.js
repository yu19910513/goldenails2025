const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
const { Miscellaneous } = require("../../models");
const { sendMessage } = require("../../util/util");
dotenv.config();


/**
 * @route GET /:title
 * @description Retrieves a miscellaneous entry based on the provided title, with specific attributes (`title` and `context`).
 * @access Public
 * 
 * @param {Object} req - The request object containing the URL parameter `title`.
 * @param {Object} res - The response object used to send back the retrieved data or error.
 * 
 * @returns {Object} 200 - JSON object containing the `title` and `context` of the miscellaneous entry.
 * @returns {Object} 404 - JSON object with an error message if the miscellaneous data is not found.
 * @returns {Object} 500 - JSON object with an error message if an internal server error occurs.
 * 
 * @throws {Error} - If an error occurs while querying the database.
 */
router.get(`/:title`, async (req, res) => {
  try {
    const { title } = req.params;
    const miscellaneous = await Miscellaneous.findOne({
      where: { title },
      attributes: ["title", "context"], // Only retrieves `title` and `context`
    });

    if (!miscellaneous) {
      return res.status(404).json({ message: "This miscellaneous data is not found." });
    }

    const data = miscellaneous.get({ plain: true });
    res.json(miscellaneous);
  } catch (error) {
    console.error("Error searching miscellaneous data:", error);
    res.status(500).json({ error: "An error occurred while searching for the miscellaneous data." });
  }
});


/**
 * POST /notify_customer
 * Sends SMS appointment confirmations to the customer and the owner.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The body of the request containing message data.
 * @param {Object} req.body.messageData - The message data object.
 * @param {string} req.body.messageData.customer_number - The customer's phone number.
 * @param {string} req.body.messageData.customer_message - The message to be sent to the customer.
 * @param {string} req.body.messageData.owner_message - The message to be sent to the owner (optional).
 * @param {Object} res - Express response object.
 * @returns {void} Sends a JSON response indicating success or failure.
 *
 * @throws {Error} Responds with a 500 status code if an error occurs while sending the SMS.
 *
 * @example
 * // Request body:
 * {
 *   "messageData": {
 *     "customer_number": "1234567890",
 *     "customer_message": "Your appointment is confirmed for 3 PM.",
 *     "owner_message": "Appointment confirmation sent to customer."
 *   }
 * }
 *
 * // Success Response:
 * {
 *   "success": true,
 *   "message": "SMS appointment confirmation sent successfully!"
 * }
 *
 * // Error Response:
 * {
 *   "success": false,
 *   "message": "Failed to send SMS appointment confirmation. Please try again later.",
 *   "error": "Detailed error message here"
 * }
 */
router.post(`/notify_customer`, async (req, res) => {
  try {
      const { messageData } = req.body;
    console.log(messageData);
    
      // Validate request body
      if (!messageData || !messageData.customer_number || !messageData.customer_message) {
          return res.status(400).json({
              success: false,
              message: 'Invalid request. Ensure customer_number and customer_message are provided.',
          });
      }

      // Send SMS to customer
      sendMessage(messageData.customer_number, messageData.customer_message);

      // Optionally send SMS to the owner
      if (process.env.OWNER_NUMBER && messageData.owner_message) {
          sendMessage(process.env.OWNER_NUMBER, messageData.owner_message);
      }

      // Send success response
      res.status(200).json({
          success: true,
          message: 'SMS appointment confirmation sent successfully!',
      });
  } catch (error) {
      console.error('Error in sending SMS:', error);

      // Send error response
      res.status(500).json({
          success: false,
          message: 'Failed to send SMS appointment confirmation. Please try again later.',
          error: error.message, // Optional: Include error details for debugging
      });
  }
});




module.exports = router;
