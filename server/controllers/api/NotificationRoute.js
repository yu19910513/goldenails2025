const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
const { sendSMS, sendEmail, sendEmailNotification } = require("../../utils/notification");
const { appointmentMessage } = require('../../utils/templates/templates');
dotenv.config();


/**
 * Handles appointment notifications via SMS and email.
 * 
 * @route POST /notify
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing message data
 * @param {Object} req.body.messageData - Notification details
 * @param {string} req.body.messageData.recipient_phone - Customer's phone number (required)
 * @param {string} [req.body.messageData.recipient_name] - Customer's name
 * @param {string} [req.body.messageData.recipient_email_address] - Customer's email
 * @param {string} [req.body.messageData.recipient_email_subject="Appointment Notification"] - Subject for customer email
 * @param {boolean|string} [req.body.messageData.recipient_optInSMS=true] - Whether customer opted into SMS notifications
 * @param {string} req.body.messageData.action - Action type (e.g., "confirm" or "cancel")
 * @param {string} req.body.messageData.appointment_date - Appointment date
 * @param {string} req.body.messageData.appointment_start_time - Appointment start time
 * @param {string} [req.body.messageData.owner_email_subject] - Subject for owner's email
 * 
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status and message
 */
router.post('/notify', async (req, res) => {
  try {
    const { messageData } = req.body;
    if (!messageData?.recipient_phone) {
      return res.status(400).json({ success: false, message: 'Invalid request. Ensure recipient_phone is provided.' });
    }

    const { OWNER_NUMBER, BUSINESS_EMAIL, STORE_EMAIL, OWNER_EMAIL } = process.env;

    // Send SMS to owner
    OWNER_NUMBER && sendSMS(OWNER_NUMBER, appointmentMessage(messageData, "owner"));

    // Send email to business owner
    if (BUSINESS_EMAIL && STORE_EMAIL && messageData.owner_email_subject) {
      sendEmailNotification([STORE_EMAIL, OWNER_EMAIL].filter(Boolean), messageData.owner_email_subject, "owner", messageData);
    }

    // Send email to customer
    messageData.recipient_email_address &&
      sendEmailNotification([messageData.recipient_email_address], messageData.recipient_email_subject || "Appointment Notification", "customer", messageData);

    // Send SMS to customer if opted in
    messageData.recipient_optInSMS !== 'false' && sendSMS(messageData.recipient_phone, appointmentMessage(messageData, "customer"));

    res.status(200).json({ success: true, message: 'Notification sent successfully!' });
  } catch (error) {
    console.error('Error in sending notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification. Please try again later.', error: error.message });
  }
});




/**
 * Handles incoming client message and forwards them via email.
 *
 * @route POST /contact
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
router.post(`/contact`, (req, res) => {
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
