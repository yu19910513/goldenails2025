import http from "../common/NodeCommon"; // Make sure this is correctly configured for your backend

class AppointmentService {
  // Fetch appointments by technician ID
  findByTechId(technicianId) {
    return http.get(`/appointments/search?tech_id=${technicianId}`);
  }

  // Create a new appointment
  create(appointmentData) {
    return http.post("/appointments", appointmentData); // Pass appointmentData as the body of the POST request
  }
}

export default new AppointmentService();
