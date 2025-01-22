import http from "../common/NodeCommon";

class TechnicianService {
    getAll() {
        return http.get("/technicians/");
    }
    getAvailableTechnicians(categoryIds) {
        return http.post("/technicians/available", { categoryIds });
    }

}

export default new TechnicianService();
