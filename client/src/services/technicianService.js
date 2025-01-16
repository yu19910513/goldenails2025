import http from "../common/NodeCommon";

class TechnicianService {
    getAll() {
        const data = http.get("/technicians/");
        console.log(data);
        return data;
    }
}

export default new TechnicianService();
