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
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day

    const groupedAppointments = {
        future: [],
        present: [],
        past: [],
    };

    appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0); // Normalize appointment date

        if (appointmentDate > today) {
            groupedAppointments.future.push(appointment);
        } else if (appointmentDate.getTime() === today.getTime()) {
            groupedAppointments.present.push(appointment);
        } else {
            groupedAppointments.past.push(appointment);
        }
    });

    // Sort each group by date (descending)
    Object.keys(groupedAppointments).forEach((group) => {
        groupedAppointments[group].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return groupedAppointments;
};

export { groupAppointments };
