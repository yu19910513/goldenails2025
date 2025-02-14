const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
const { Miscellaneous } = require("../../models");
const { sendMessage, sendEmail } = require("../../util/util");
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
    res.json(miscellaneous);
  } catch (error) {
    console.error("Error searching miscellaneous data:", error);
    res.status(500).json({ error: "An error occurred while searching for the miscellaneous data." });
  }
});


/**
* Handles customer notification requests by sending SMS messages.
*
* This endpoint receives a request containing message data and sends SMS notifications
* to the customer and optionally to the owner.
*
* @route POST /notify_customer
* @param {Object} req - Express request object.
* @param {Object} req.body - The request body containing message details.
* @param {Object} req.body.messageData - The message data object.
* @param {string} req.body.messageData.customer_number - The customer's phone number.
* @param {string} req.body.messageData.customer_message - The message to send to the customer.
* @param {boolean} [req.body.messageData.optInSMS] - Whether the customer opted in for SMS notifications.
* @param {string} [req.body.messageData.owner_message] - Optional message to send to the owner.
* @param {Object} res - Express response object.
* @returns {Object} JSON response with success status and message.
*/
router.post(`/notify_customer`, async (req, res) => {
  try {
    const { messageData } = req.body;
    console.log(messageData);

    // Optionally send SMS to the owner
    if (process.env.OWNER_NUMBER && messageData.owner_message) {
      console.log("sending notification to the owner...");
      sendMessage(process.env.OWNER_NUMBER, messageData.owner_message);
    }

    if (process.env.BUSINESS_EMAIL && process.env.STORE_EMAIL) {
      sendEmail({
        address: [process.env.STORE_EMAIL, process.env.OWNER_EMAIL],
        subject: messageData.owner_message.toLowerCase().includes("cancelled") ? "Cancel Request" : "New Appointment",
        text: messageData.owner_message,
      });
    }

    // Validate request body
    if (!messageData || !messageData.customer_number || !messageData.customer_message) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Ensure customer_number and customer_message are provided.',
      });
    }

    // Send SMS to customer
    if (messageData.optInSMS == 'true') {
      console.log("sending notification to the customer...");
      sendMessage(messageData.customer_number, messageData.customer_message);
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

/**
 * Handles incoming client message and forwards them via email.
 *
 * @route POST /contact_owner
 * @param {Object} req - Express request object.
 * @param {Object} req.body - The request body containing the email details.
 * @param {Object} req.body.email_object - The email content sent by the client.
 * @param {string} req.body.email_object.name - The sender's name.
 * @param {string} req.body.email_object.email - The sender's email address.
 * @param {string} req.body.email_object.message - The message content.
 * @param {Object} res - Express response object.
 * @returns {void} Sends a JSON response indicating success or failure.
 *
 * @throws {Error} Returns a 500 status code if an internal server error occurs.
 */
router.post(`/contact_owner`, (req, res) => {
  try {
    const { email_object } = req.body;
    if (process.env.BUSINESS_EMAIL && process.env.STORE_EMAIL) {
      sendEmail({
        address: [process.env.STORE_EMAIL, process.env.OWNER_EMAIL],
        subject: `${email_object.name} (${email_object.email}) sent you a message`,
        text: email_object.message,
      });
      res.status(200).json({
        success: true,
        message: 'Client message sent successfully!',
      });
    } else {
      res.status(400).json({ message: "Missing business/store emails." });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send the message. Please try again later.',
      error: error.message, // Optional: Include error details for debugging
    });
  }
});





module.exports = router;
