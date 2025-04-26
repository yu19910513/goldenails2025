const fs = require('fs');
const handlebars = require('handlebars');
const path = require('path');
const { Appointment, Technician, Service } = require("../models");
const { Op } = require("sequelize");
const { DateTime } = require("luxon");
const overlap = require('./overlap');

/**
 * Groups appointments into future, present, and past, and sorts each group by most recent date first.
 *
 * @param {Array<Object>} appointments - List of appointment objects, each containing at least a `date` property.
 * @param {string} appointments[].date - The date of the appointment in ISO format (e.g., '2025-04-26').
 * @returns {Object} An object containing grouped and sorted appointments:
 *  - future: Array of future appointments, sorted by latest date first.
 *  - present: Array of today's appointments, sorted by latest date first.
 *  - past: Array of past appointments, sorted by latest date first.
 *
 * @example
 * const grouped = groupAppointments([{ date: '2025-04-27' }, { date: '2025-04-25' }]);
 * console.log(grouped.future); // [{ date: '2025-04-27' }]
 * console.log(grouped.past);   // [{ date: '2025-04-25' }]
 */
const groupAppointments = (appointments) => {
    const today = now().startOf('day');

    const groupedAppointments = {
        future: [],
        present: [],
        past: [],
    };

    appointments.forEach((appointment) => {
        const appointmentDate = DateTime.fromISO(appointment.date, { zone: 'America/Los_Angeles' }).startOf('day');

        if (appointmentDate > today) {
            groupedAppointments.future.push(appointment);
        } else if (appointmentDate.equals(today)) {
            groupedAppointments.present.push(appointment);
        } else {
            groupedAppointments.past.push(appointment);
        }
    });

    // Sort each group by date (most recent first)
    Object.keys(groupedAppointments).forEach((group) => {
        groupedAppointments[group].sort((a, b) => {
            const dateA = DateTime.fromISO(a.date, { zone: 'America/Los_Angeles' });
            const dateB = DateTime.fromISO(b.date, { zone: 'America/Los_Angeles' });
            return dateB.toMillis() - dateA.toMillis(); // Descending order
        });
    });

    return groupedAppointments;
};


/**
 * Returns the current date and time in the 'America/Los_Angeles' timezone.
 * 
 * This function uses Luxon to correctly handle timezones, including automatic adjustments
 * for Pacific Standard Time (PST) and Pacific Daylight Time (PDT) based on the current date.
 * 
 * @returns {DateTime} A Luxon DateTime object representing the current time in Los Angeles timezone.
 * 
 * @example
 * const currentTime = now();
 * console.log(currentTime.toISO()); // Outputs something like "2025-04-26T15:30:00.000-07:00"
 */
const now = () => {
    return DateTime.now().setZone('America/Los_Angeles');
};




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
 */
const okayToAssign = async (technician, appointment) => {
    try {
        if (!technician) {
            console.log("Technician not found");
            return false;
        }

        if (!appointment || !appointment.date || !appointment.start_service_time) {
            console.log("Appointment or start time not found");
            return false;
        }

        const services = appointment.Services;
        if (!services || services.length === 0) {
            console.log("No services found for the appointment");
            return false;
        }

        // Parse start time correctly with Luxon
        const startServiceTime = DateTime.fromISO(`${appointment.date}T${appointment.start_service_time}`, { zone: "America/Los_Angeles" });
        if (!startServiceTime.isValid) {
            console.log("Invalid start service time");
            return false;
        }

        // Calculate end time
        const totalServiceMinutes = services.reduce((sum, service) => sum + service.time, 0);
        const endServiceTime = startServiceTime.plus({ minutes: totalServiceMinutes });

        // Luxon weekday: Monday = 1, Sunday = 7
        const selectedWeekday = startServiceTime.weekday % 7; // Make Sunday = 0, Monday = 1, etc.

        // Parse technician's unavailability (array of numbers 0-6)
        const unavailableDays = (technician.unavailability || "")
            .split(",")
            .map(day => day.trim())
            .filter(day => day !== "")
            .map(Number)
            .filter(day => !isNaN(day) && day >= 0 && day <= 6);

        if (unavailableDays.includes(selectedWeekday)) {
            console.log("Technician is unavailable on this weekday");
            return false;
        }

        // Fetch existing appointments for the technician on that date
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
                date: appointment.date,
                [Op.or]: [
                    { note: null },
                    { note: { [Op.not]: "deleted" } },
                ]
            }
        });

        // Check for overlap — PASS Luxon objects directly
        const hasConflict = overlap(existingAppointments, startServiceTime, endServiceTime);

        return !hasConflict;

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
