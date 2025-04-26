const { DateTime } = require('luxon');

/**
 * Checks if a new appointment overlaps with any existing appointments.
 * 
 * @param { Array < Object >} existingAppointments - An array of existing appointments to check against.
 * Each appointment should have the following properties:
 * - { string } date - The date of the appointment in ISO format(e.g., '2025-01-30').
 * - { string } start_service_time - The start time of the service in HH:mm format(e.g., '10:00').
 * - { Array<Object>} Services - An array of service objects, each containing a `time` property(duration in minutes).
 * 
 * @param { DateTime } newStart - The start time of the new appointment as a Luxon DateTime object.
 * @param { DateTime } newEnd - The end time of the new appointment as a Luxon DateTime object.
 * 
 * @returns { boolean } - Returns`true` if the new appointment overlaps with any existing appointments, otherwise`false`.
 *
 * @example
    * const existingAppointments = [
 * { date: '2025-01-30', start_service_time: '10:00', Services: [{ time: 30 }] }
        * ];
 * const newStart = DateTime.fromISO('2025-01-30T10:15', { zone: 'America/Los_Angeles' });
 * const newEnd = DateTime.fromISO('2025-01-30T10:45', { zone: 'America/Los_Angeles' });
 * console.log(overlap(existingAppointments, newStart, newEnd)); // true
 */
const overlap = (existingAppointments, newStart, newEnd) => {
    for (const appointment of existingAppointments) {
        const appointmentStart = DateTime.fromISO(
            `${appointment.date}T${appointment.start_service_time}`,
            { zone: 'America/Los_Angeles' }
        );

        const appointmentDurationMinutes = appointment.Services.reduce((sum, service) => sum + service.time, 0);
        const appointmentEnd = appointmentStart.plus({ minutes: appointmentDurationMinutes });

        // Check if there is any overlap
        const isOverlap =
            (newStart >= appointmentStart && newStart < appointmentEnd) || // new start inside existing
            (newEnd > appointmentStart && newEnd <= appointmentEnd) ||     // new end inside existing
            (newStart <= appointmentStart && newEnd >= appointmentEnd);    // new completely covers existing

        if (isOverlap) {
            return true;
        }
    }
    return false;
};

module.exports = overlap;
