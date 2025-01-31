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

/**
 * Checks if a new appointment overlaps with any existing appointments.
 * 
 * @param {Array} existingAppointments - An array of existing appointments to check against.
 * Each appointment should have the following properties:
 *   - {string} date - The date of the appointment in ISO format (e.g., '2025-01-30').
 *   - {string} start_service_time - The start time of the service in HH:mm format (e.g., '10:00').
 *   - {Array} Services - An array of service objects, each containing a `time` property that represents the duration of the service in minutes.
 * 
 * @param {Date} start_service_time_obj - The start time of the new appointment as a Date object.
 * 
 * @param {Date} end_service_time - The end time of the new appointment as a Date object.
 * 
 * @returns {boolean} - Returns `true` if the new appointment overlaps with any existing appointments, otherwise `false`.
 * 
 * @example
 * const existingAppointments = [
 *     { 
 *         date: '2025-01-30', 
 *         start_service_time: '10:00', 
 *         Services: [{ time: 30 }] 
 *     },
 *     { 
 *         date: '2025-01-30', 
 *         start_service_time: '11:00', 
 *         Services: [{ time: 60 }] 
 *     }
 * ];
 * const start_service_time_obj = new Date('2025-01-30T10:15');
 * const end_service_time = new Date('2025-01-30T10:45');
 * 
 * console.log(overlap(existingAppointments, start_service_time_obj, end_service_time)); // true
 */
const overlap = (existingAppointments, start_service_time_obj, end_service_time) => {
    for (const appointment of existingAppointments) {
        const appointmentStart = new Date(`${appointment.date}T${appointment.start_service_time}`);
        const appointmentTime = appointment.Services.reduce((sum, service) => sum + service.time, 0);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointmentTime * 60000);

        // Check if the new appointment overlaps with this one
        if (
            (start_service_time_obj >= appointmentStart && start_service_time_obj < appointmentEnd) ||
            (end_service_time > appointmentStart && end_service_time <= appointmentEnd) ||
            (start_service_time_obj <= appointmentStart && end_service_time >= appointmentEnd)
        ) {
            return true;
        }
    }
    return false;
}


module.exports = { groupAppointments, sendMessage, now, overlap };
