const twilio = require('twilio');
const dotenv = require('dotenv');
const nodemailer = require("nodemailer");
dotenv.config();


/**
 * Sends a SMS message using Twilio's API.
 *
 * @param {string} RecipientPhoneNumber - The recipient's phone number (10-digit format without country code).
 * @param {string} message - The content of the message to be sent.
 * @throws {Error} Will log an error if the message fails to send.
 *
 * @example
 * sendSMS('1234567890', 'Hello, this is a test message!');
 */
const sendSMS = (RecipientPhoneNumber, message) => {
    const client = new twilio(process.env.TWILLIO_SID, process.env.TWILLIO_TOKEN);
    client.messages.create({
        body: message,        // Message content
        from: '+18447541698',       // Your Twilio phone number
        to: `+1${RecipientPhoneNumber}`      // Recipient's phone number
    })
        .then(message => console.log(`Message sent with SID: ${message.sid}`))
        .catch(err => console.log('Error sending message:', err));
}


/**
 * Sends an email using Gmail's SMTP service.
 *
 * @param {Object} email_object - The email details.
 * @param {string|string[]} email_object.address - Recipient's email address or an array of email addresses.
 * @param {string} email_object.subject - Email subject.
 * @param {string} email_object.text - Email body in plain text format.
 *
 * @returns {void} - Logs success or error messages to the console.
 *
 * @note Must Have 2FA Enabled: App Passwords require two-step verification.
 * @note Uses an App Password instead of the regular Gmail password for security.
 */
const sendEmail = (email_object) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.BUSINESS_EMAIL, // Sender email
            pass: process.env.APP_PASSWORD, // App password from Google
        },
    });

    const mailOptions = {
        from: process.env.BUSINESS_EMAIL,
        to: Array.isArray(email_object.address) ? email_object.address : [email_object.address].join(", "),
        subject: email_object.subject,
        text: email_object.text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};


module.exports = { sendSMS, sendEmail };
