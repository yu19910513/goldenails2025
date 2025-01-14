import http from "../common/NodeCommon";

class ItemService {
  getAll() {
    return http.get("/services/");
  }
}

export default new ItemService();
