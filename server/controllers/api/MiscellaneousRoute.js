const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
const { Miscellaneous } = require("../../models");
const { sendMessage, sendEmail } = require("../../util/util");
dotenv.config();


/**
 * Retrieves miscellaneous data based on the provided title.
 * 
 * This endpoint searches for miscellaneous data using the title query parameter,
 * and returns the `title` and `context` attributes of the matching record.
 * If no matching data is found, it returns a 404 status with an appropriate message.
 * In case of any server errors, a 500 status code is returned.
 * 
 * @route GET /key
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters sent in the request.
 * @param {string} req.query.title - The title of the miscellaneous data to search for.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response containing the `title` and `context` of the found miscellaneous data.
 * @returns {Object} res.body - The miscellaneous data object.
 * @returns {string} res.body.title - The title of the miscellaneous data.
 * @returns {string} res.body.context - The context of the miscellaneous data.
 * @throws {Object} 404 - If no matching miscellaneous data is found.
 * @throws {Object} 500 - If there is an error while searching for the data.
 * 
 * @example
 * // Example of the response when found
 * {
 *   "title": "Sample Title",
 *   "context": "Sample context content"
 * }
 * 
 * @example
 * // Example of the response when not found
 * {
 *   "message": "This miscellaneous data is not found."
 * }
 */
router.get(`/key`, async (req, res) => {
  try {
    const { title } = req.query;
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
 * Endpoint to notify customers via SMS and email.
 * 
 * @route POST /notify_customer
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing message data.
 * @param {string} req.body.customer_number - Customer's phone number.
 * @param {string} req.body.customer_message - Message to send to the customer.
 * @param {string} [req.body.owner_message] - Optional message for the owner.
 * @param {string} [req.body.customer_email] - Optional email for the customer.
 * @param {string} [req.body.optInSMS] - Whether the customer opted in for SMS.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with success or error message.
 */
router.post('/notify_customer', async (req, res) => {
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

    const { owner_message, customer_email, customer_number, customer_message, optInSMS } = messageData;
    const { OWNER_NUMBER, BUSINESS_EMAIL, STORE_EMAIL, OWNER_EMAIL } = process.env;

    // Send SMS to the owner if applicable
    if (OWNER_NUMBER && owner_message) {
      console.log('Sending SMS notification to the owner...');
      sendMessage(OWNER_NUMBER, owner_message);
    }

    // Send email to the business owner
    if (BUSINESS_EMAIL && STORE_EMAIL) {
      console.log('Sending email notification to the owner...');
      sendEmail({
        address: [STORE_EMAIL, OWNER_EMAIL].filter(Boolean), // Ensure valid emails only
        subject: owner_message.toLowerCase().includes('cancelled') ? 'Cancel Request' : 'New Appointment',
        text: owner_message,
      });
    }

    // Send email to the customer if applicable
    if (customer_email) {
      console.log('Sending email notification to the customer...');
      sendEmail({
        address: customer_email,
        subject: customer_message.toLowerCase().includes('cancelled') ? 'Cancellation' : 'Appointment Confirmation',
        text: customer_message,
      });
    }

    // Send SMS to customer if opted in
    if (optInSMS !== 'false') {
      console.log('Sending SMS notification to the customer...');
      sendMessage(customer_number, customer_message);
    }

    res.status(200).json({
      success: true,
      message: 'SMS appointment confirmation sent successfully!',
    });
  } catch (error) {
    console.error('Error in sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification. Please try again later.',
      error: error.message,
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
