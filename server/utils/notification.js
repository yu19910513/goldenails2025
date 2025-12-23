const twilio = require('twilio');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");
const { generateHtmlFromTemplate } = require("./helper");
const { appointmentMessage } = require('./templates/templates');
dotenv.config();


/**
 * Sends an SMS message using Twilio.
 *
 * @param {string} recipientPhoneNumber - The recipient's phone number. Can start with '+' or will default to +1 (US).
 * @param {string} message - The message content to send.
 * @returns {Promise<Object>} Returns the Twilio message object if successful,
 * or an object with { success: false, error: string } if there was an error.
 */
const sendSMS = async (recipientPhoneNumber, message) => {
    try {
        const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
        const sms = await client.messages.create({
            body: message,
            from: `+1${process.env.TWILIO_NUMBER}`,  // Your Twilio phone number
            to: recipientPhoneNumber.startsWith('+') ? recipientPhoneNumber : `+1${recipientPhoneNumber}`
        });

        console.log(`Message sent with SID: ${sms.sid}`);
        return sms;  // Return message object for further handling if needed
    } catch (err) {
        console.error('Error sending message:', err);
        // throw err;  // Rethrow error so the caller can handle it
        return { success: false, error: err.message };
    }
};


/**
 * Lightweight email delivery wrapper around Nodemailer.
 *
 * Environment variables required:
 * - BUSINESS_EMAIL: Gmail address used as sender (SMTP username)
 * - APP_PASSWORD: Gmail App Password for SMTP auth
 *
 * @typedef {Object} EmailPayload
 * @property {string|string[]} address - Recipient(s); accepts a single address or an array.
 * @property {string} subject - Subject line of the email.
 * @property {string} [text] - Optional plain-text body used as a fallback.
 * @property {string} html - HTML body of the email.
 *
 * @typedef {Object} SendEmailError
 * @property {false} success - Indicates failure.
 * @property {string} error - Human-readable error message.
 *
 * @typedef {undefined|SendEmailError} SendEmailResult
 *
 * @example
 * await emailApi.sendEmail({
 *   address: ['user@example.com', 'other@example.com'],
 *   subject: 'Appointment Reminder',
 *   text: 'Your appointment is tomorrow at 10:00 AM.',
 *   html: '<p>Your appointment is <strong>tomorrow</strong> at 10:00 AM.</p>'
 * });
 */
const emailApi = {
    /**
     * Sends an email using Gmail SMTP via Nodemailer.
     *
     * Creates a transporter on each invocation. Returns `undefined` on success,
     * or `{ success: false, error }` on failure. Errors are captured and not thrown.
     *
     * @param {EmailPayload} email_object - Email content and recipients.
     * @returns {Promise<SendEmailResult>} Resolves to `undefined` on success, or an error object on failure.
     */
    sendEmail: async (email_object) => {
        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.BUSINESS_EMAIL, // Sender email
                    pass: process.env.APP_PASSWORD, // App password
                },
            });

            const mailOptions = {
                from: process.env.BUSINESS_EMAIL,
                to: email_object.address, // Supports string or array
                subject: email_object.subject,
                text: email_object.text, // Optional plain text fallback
                html: email_object.html, // HTML version
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${email_object.address}:`, info.response);
        } catch (error) {
            console.error("Failed to send email:", error.message);
            // throw error; // Propagate error
            return { success: false, error: error.message };
        }
    }
};

/**
 * Sends an email notification to the specified recipients with appointment details.
 *
 * @param {Array<string>} recipients - An array of email addresses to which the email should be sent.
 * @param {string} subject - The subject of the email.
 * @param {string} role - The role associated with the email (e.g., "admin", "user").
 * @param {Object} data_object - The data object containing the appointment details to be included in the email.
 *
 * @returns {void} Returns nothing. If no valid email recipients are provided, it logs a warning.
 *
 * @example
 * sendEmailNotification(
 *   ['example@example.com'],
 *   'Appointment Reminder',
 *   'admin',
 *   { appointmentDate: '2025-03-01', patientName: 'John Doe' }
 * );
 */
const sendEmailNotification = (recipients, subject, role, data_object) => {
    if (!recipients.length) return console.warn(`No valid email provided for ${role}. Skipping email.`);
    emailApi.sendEmail({
        address: recipients,
        subject,
        text: appointmentMessage(data_object, role),
        html: generateHtmlFromTemplate({
            template: `appointment/${subject.toLowerCase().replace(/\s+/g, '_')}.handlebars`,
            content: data_object
        })
    });
};

module.exports = { sendSMS, sendEmail: emailApi.sendEmail, sendEmailNotification, emailApi };
