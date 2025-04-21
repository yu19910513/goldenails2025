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

module.exports = overlap;