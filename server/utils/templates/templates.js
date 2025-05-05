/**
 * Generates an appointment confirmation or cancellation message for customers and owners.
 * 
 * @param {Object} data - The appointment details.
 * @param {"confirm" | "cancel"} data.action - The type of appointment action.
 * @param {string} data.recipient_name - The name of the recipient.
 * @param {string} [data.recipient_phone] - The phone number of the recipient (for owner messages).
 * @param {string} data.appointment_date - The date of the appointment.
 * @param {string} data.appointment_start_time - The start time of the appointment.
 * @param {string} [data.appointment_end_time] - The end time of the appointment (for owner messages).
 * @param {string} [data.appointment_technician] - The technician assigned to the appointment (for owner messages).
 * @param {string} data.appointment_services - The services booked for the appointment.
 * @param {"customer" | "owner"} recipient - The recipient type (customer or owner).
 * @returns {string} The generated message.
 */
const appointmentMessage = (data, recipient) => {
    if (recipient === "customer") {
        if (data.action === "confirm") {
            return `Hi ${data.recipient_name}, your appointment at Golden Nails Gig Harbor for ${data.appointment_services} on ${data.appointment_date} at ${data.appointment_start_time} is confirmed!\n\nTo view or cancel, visit: https://www..com/appointmenthistory (name & phone needed).\n\nNote: No online cancellations within 24 hrs. Call (253) 851-7563 to reschedule. See you soon! 💅`;
        } else if (data.action === "cancel") {
            return `Dear ${data.recipient_name}, We would like to inform you that your appointment at Golden Nails Gig Harbor, scheduled for ${data.appointment_date}, at ${data.appointment_start_time}, has been successfully cancelled. If you have any further questions or would like to reschedule, please feel free to contact us at (253) 851-7563.`;
        }
    } else if (recipient === "owner") {
        if (data.action === "confirm") {
            return `Appointment confirmed for ${data.recipient_name} (${data.recipient_phone}) on ${data.appointment_date}, from ${data.appointment_start_time} to ${data.appointment_end_time}. Technician: ${data.appointment_technician}. Services: ${data.appointment_services}.`;
        } else if (data.action === "cancel") {
            return `Appointment cancelled by ${data.recipient_name} (${data.recipient_phone}), scheduled for ${data.appointment_date}, at ${data.appointment_start_time}. Technician: ${data.appointment_technician}.`;
        }
    }
    return "Invalid message type or recipient.";
};

module.exports = { appointmentMessage };