import http from "../common/NodeCommon";

class TechnicianService {
    getAll() {
        return http.get("/technicians/");
    }
    getAvailableTechnicians(serviceIds) {
        return http.post("/technicians/available", { serviceIds });
    }

}

export default new TechnicianService();
