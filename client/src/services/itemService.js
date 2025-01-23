import http from "../common/NodeCommon";

/**
 * A service class for managing services.
 */
class ItemService {
  /**
   * Retrieves a list of all available services.
   * 
   * @returns {Promise<Array<Object>>} A promise resolving to an array of service objects.
   */
  getAll() {
    return http.get("/services/");
  }
}

export default new ItemService();
