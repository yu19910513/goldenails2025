const twilio = require('twilio');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");
const { generateHtmlFromTemplate } = require("./helper");
const { appointmentMessage } = require('./templates/templates');
dotenv.config();


/**
 * Sends an SMS message using Twilio.
 * 
 * @param {string} recipientPhoneNumber - The recipient's phone number (e.g., "+15551234567" or "5551234567").
 * @param {string} message - The message content to be sent.
 * @returns {Promise<object>} A promise that resolves with the Twilio message object if successful.
 * @throws {Error} Throws an error if the message fails to send.
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
        throw err;  // Rethrow error so the caller can handle it
    }
};


/**
 * Sends an email using Gmail's SMTP service with HTML support.
 *
 * @param {Object} email_object - The email details.
 * @param {string|string[]} email_object.address - Recipient's email(s).
 * @param {string} email_object.subject - Email subject.
 * @param {string} [email_object.text] - Plain text version of the email.
 * @param {string} [email_object.html] - HTML content for the email body.
 *
 * @throws {Error} - If email fails to send.
 */
const sendEmail = async (email_object) => {
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
        throw error; // Propagate error
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
    sendEmail({
        address: recipients,
        subject,
        text: appointmentMessage(data_object, role),
        html: generateHtmlFromTemplate({
            template: `appointment/${subject.toLowerCase().replace(/\s+/g, '_')}.handlebars`,
            content: data_object
        })
    });
};



module.exports = { sendSMS, sendEmail, sendEmailNotification };
