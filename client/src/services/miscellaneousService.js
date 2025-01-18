import http from "../common/NodeCommon";

class MiscellaneousService {
  find(title){
    return http.get(`/miscellaneouses/${title}/`);
  }
}

export default new MiscellaneousService();
