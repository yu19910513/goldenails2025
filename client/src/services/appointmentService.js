
import http from "../common/NodeCommon";
/**
 * A service class for managing appointments.
 */
class AppointmentService {

/**
 * Fetches grouped appointments for a specific date.
 *
 * This function validates the date format to ensure it follows the `YYYY-MM-DD` format.
 * It then makes an HTTP GET request to the `/appointments/:date` endpoint.
 *
 * @param {string} date - The date for which appointments are to be fetched (format: YYYY-MM-DD).
 * @returns {Promise<Object>} A promise resolving to the grouped appointments data.
 * @throws {Error} Throws an error if the provided date is not in the valid format.
 *
 * @example
 * getTechnicianGroupedAppointments("2025-01-24")
 *   .then((data) => {
 *     console.log("Appointments:", data);
 *   })
 *   .catch((error) => {
 *     console.error("Error:", error.message);
 *   });
 */
  getTechnicianGroupedAppointments(date) {
    // Validate the date format (optional but recommended)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD.");
    }
  
    // Perform the GET request to fetch appointments for the given date
    return http.get(`/appointments/${date}`);
  }
  
  /**
   * Fetch upcoming appointments by technician ID.
   * 
   * @param {number|string} technicianId - The ID of the technician.
   * @returns {Promise<Object>} A promise resolving to the response containing the list of appointments.
   */
  findByTechId(technicianId) {
    return http.get(`/appointments/upcoming?tech_id=${technicianId}`);
  }

  /**
   * Create a new appointment.
   * 
   * @param {Object} appointmentData - The data for the new appointment.
   * @param {string} appointmentData.date - The date of the appointment in ISO format.
   * @param {number|string} appointmentData.customer_id - The ID of the customer booking the appointment.
   * @param {Array<Object>} appointmentData.services - The list of services for the appointment.
   * @param {number|string} appointmentData.technician_id - The ID of the technician for the appointment.
   * @returns {Promise<Object>} A promise resolving to the response containing the created appointment details.
   */
  create(appointmentData) {
    return http.post("/appointments", appointmentData); // Pass appointmentData as the body of the POST request
  }

  /**
   * Fetch the appointment history for a specific customer.
   * 
   * @param {number|string} customer_id - The ID of the customer.
   * @returns {Promise<Object>} A promise resolving to the response containing the customer's appointment history.
   */
  customer_history(customer_id) {
    return http.get(`/appointments/customer_history?customer_id=${customer_id}`);
  }

  /**
 * Soft deletes an appointment by updating its note to "deleted".
 * 
 * @param {number} appointment_id - The ID of the appointment to be soft deleted.
 * @returns {Promise} - A promise resolving to the HTTP response from the API.
 */
  soft_delete(appointment_id) {
    return http.put(`/appointments/update_note`, { id: appointment_id, note: "deleted" });
  }
}

export default new AppointmentService();
