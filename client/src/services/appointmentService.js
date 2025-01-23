
import http from "../common/NodeCommon";
/**
 * A service class for managing appointments.
 */
class AppointmentService {
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
}

export default new AppointmentService();
