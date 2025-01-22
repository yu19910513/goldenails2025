import http from "../common/NodeCommon";

class AppointmentService {
  findByTechId(technicianId) {
    return http.get(`/appointments/search?tech_id=${technicianId}`);
  }
}

export default new AppointmentService();
