const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();
/**
 * Groups appointments into future, present, and past, and sorts each group by most recent date first.
 * 
 * @param {Array<Object>} appointments - List of appointment objects, each containing at least a `date` property.
 * @param {string} appointments[].date - The date of the appointment in ISO format or a parsable string.
 * @returns {Object} An object containing grouped and sorted appointments:
 *  - future: Array of appointments in the future.
 *  - present: Array of today's appointments.
 *  - past: Array of appointments in the past.
 */
const groupAppointments = (appointments) => {
    const today = now();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    const groupedAppointments = {
        future: [],
        present: [],
        past: [],
    };

    appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date + 'T00:00:00');
        appointmentDate.setHours(0, 0, 0, 0); // Normalize appointment date

        if (appointmentDate > today) {
            groupedAppointments.future.push(appointment);
        } else if (appointmentDate.getTime() === today.getTime()) {
            groupedAppointments.present.push(appointment);
        } else {
            groupedAppointments.past.push(appointment);
        }
    });

    // Sort each group by date (ascending)
    Object.keys(groupedAppointments).forEach((group) => {
        groupedAppointments[group].sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    return groupedAppointments;
};

/**
 * Sends a message using Twilio's API.
 *
 * @param {string} RecipientPhoneNumber - The recipient's phone number (10-digit format without country code).
 * @param {string} message - The content of the message to be sent.
 * @throws {Error} Will log an error if the message fails to send.
 *
 * @example
 * sendMessage('1234567890', 'Hello, this is a test message!');
 */
const sendMessage = (RecipientPhoneNumber, message) => {
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
 * Gets the current date and time adjusted to Pacific Time (PT).
 * 
 * The function calculates the UTC offset and adjusts the local time accordingly.
 * Pacific Standard Time (PST) is UTC-8, and Pacific Daylight Time (PDT) is UTC-7.
 * The adjustment considers the server's local time zone and ensures the returned 
 * time reflects Pacific Time.
 *
 * @returns {Date} The current date and time in Pacific Time.
 */
const now = () => {
    const now = new Date();
    const offsetInHours = now.getTimezoneOffset() / 60 + 8; // Adjust UTC to Pacific Time (Standard Time: -8)
    now.setHours(now.getHours() - offsetInHours);
    return now;
}


module.exports = { groupAppointments, sendMessage, now };
