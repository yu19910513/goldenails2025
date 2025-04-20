const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const { Appointment, Technician, Service } = require("../models");
const { Op } = require("sequelize");
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
 * Determines whether a technician can be assigned to a given appointment without overlapping existing appointments.
 *
 * @async
 * @function okayToAssign
 * @param {Object} technician - The technician object. Must include at least an `id` property.
 * @param {Object} appointment - The appointment object.
 * @param {string} appointment.date - The date of the appointment in `YYYY-MM-DD` format.
 * @param {string} appointment.start_service_time - The start time of the appointment in `HH:mm` format.
 * @param {Array<Object>} appointment.Services - An array of service objects with a `time` (duration in minutes) property.
 * @returns {Promise<boolean>} - Returns `true` if the technician is available during the given appointment time, otherwise `false`.
 *
 * @throws Will return `false` if the appointment data is incomplete or incorrectly formatted.
 *
 * @example
 * const available = await okayToAssign(
 *   { id: 1 },
 *   {
 *     date: '2025-04-20',
 *     start_service_time: '10:30',
 *     Services: [{ time: 30 }, { time: 45 }]
 *   }
 * );
 * // returns true or false
 *
 * @description
 * This function checks if a technician is available for a new appointment by:
 * 1. Calculating the start and end time of the new appointment.
 * 2. Fetching all existing, non-deleted appointments for the technician on the same date.
 * 3. Checking for any time overlaps between the new appointment and existing ones.
 * 4. If the technician is unavailable on the appointment's weekday.
 */
const okayToAssign = async (technician, appointment) => {
    try {
        if (!technician) {
            console.log("tech not found");
            return false;
        }

        if (!appointment || !appointment.date || !appointment.start_service_time) {
            console.log("appt not found");
            return false;
        }

        const start_service_time_obj = new Date(`${appointment.date}T${appointment.start_service_time}`);
        if (isNaN(start_service_time_obj.getTime())) {
            console.log("start service time not found");
            return false;
        }

        const services = appointment.Services;
        if (!services || services.length === 0) {
            console.log("no service found");
            return false;
        }

        const totalServiceTime = services.reduce((sum, service) => sum + service.time, 0);
        const end_service_time = new Date(start_service_time_obj.getTime() + totalServiceTime * 60000);
        const date = appointment.date;

        // Parse the technician's unavailability into a set of unavailable weekdays (0=Sunday, 6=Saturday)
        const unavailableDays = (technician.unavailability || "")
            .split(",")
            .map(day => day.trim()) // Remove spaces
            .filter(day => day !== "") // Remove empty values
            .map(Number)
            .filter(day => !isNaN(day) && day >= 0 && day <= 6);
        const selectedWeekday = (new Date(date).getDay() + 1) % 7;

        if (unavailableDays.includes(selectedWeekday)) {
            console.log("tech not available on this weekday");
            return false;
        }

        const existingAppointments = await Appointment.findAll({
            include: [
                {
                    model: Technician,
                    where: { id: technician.id }
                },
                {
                    model: Service,
                    attributes: ["time"],
                    through: { attributes: [] },
                }
            ],
            where: {
                date,
                [Op.or]: [
                    { note: null },
                    { note: { [Op.not]: "deleted" } },
                ]
            }
        });

        return !overlap(existingAppointments, start_service_time_obj, end_service_time);
    } catch (err) {
        console.error("Error in okayToAssign:", err);
        return false;
    }
};


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
 * Generates HTML from a Handlebars template.
 * 
 * This function reads a Handlebars template file, compiles it, and returns the populated HTML string.
 * If the template file is not found, it logs a warning and returns `null`.
 * In case of any other error, it logs the error and re-throws it.
 * 
 * @param {Object} data_object - The data object used to populate the template.
 * @param {string} data_object.template - The relative path to the template file (e.g., 'appointment/confirmation.handlebars').
 * @param {Object} data_object.content - The content to populate the template with (key-value pairs).
 * 
 * @returns {string|null} - The populated HTML string generated from the template or `null` if the template file is not found.
 * 
 * @throws {Error} - Re-throws an error if an error occurs during template generation, after logging the error.
 */
const generateHtmlFromTemplate = (data_object) => {
    try {
        // Resolve the template path
        const templatePath = path.resolve(__dirname, 'templates', data_object.template);

        // Check if the template file exists
        if (!fs.existsSync(templatePath)) {
            console.warn(`Template file ${data_object.template} not found.`);
            return null;
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



module.exports = { groupAppointments, now, overlap, validateContactType, generateHtmlFromTemplate, okayToAssign };
