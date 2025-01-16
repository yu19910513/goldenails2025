import http from "../common/NodeCommon";

class CustomerService {
  getOneByPhoneNumber(phoneNumber) {
    return http.get(`/customers/search?phone=${phoneNumber}`);
  }

  createCustomer(customerData) {
    return http.post(`/customers/`, customerData);
  }
}

export default new CustomerService();
