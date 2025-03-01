const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
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

/**
 * Validates whether the input is an email or a phone number.
 * @param {string} input - The input string to validate.
 * @returns {string} - Returns "email" if input is an email, "phone" if it's a phone number, otherwise "invalid".
 */
const validateContactType = (input) => {
    const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    const phoneRegex = /^\+?\d{1,3}?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

    if (emailRegex.test(input)) {
        return "email";
    } else if (phoneRegex.test(input)) {
        return "phone";
    } else {
        return "invalid";
    }
}

/**
 * Generates HTML content by compiling a Handlebars template with the provided data.
 * 
 * @param {Object} data_object - The data used to populate the template.
 * @param {string} data_object.template - The path to the Handlebars template (relative to the templates directory).
 * @param {Object} data_object.content - The content to be inserted into the template.
 * 
 * @returns {string} - The generated HTML content with the populated template.
 * 
 * @throws {Error} - Throws an error if the template file cannot be read or is invalid.
 */
const generateHtmlFromTemplate = (data_object) => {
    try {
        // Resolve the template path
        const templatePath = path.resolve(__dirname, 'templates', data_object.template);

        // Check if the template file exists
        if (!fs.existsSync(templatePath)) {
            throw new Error(`Template file ${data_object.template} does not exist.`);
        }

        // Read the .handlebars file
        const templateFile = fs.readFileSync(templatePath, 'utf-8');

        // Compile the template using Handlebars
        const compiledTemplate = handlebars.compile(templateFile);

        // Return the populated template
        return compiledTemplate(data_object.content);
    } catch (error) {
        console.error("Error generating HTML from template:", error.message);
        throw error; // Re-throw the error after logging it
    }
};



module.exports = { groupAppointments, now, overlap, validateContactType, generateHtmlFromTemplate };
