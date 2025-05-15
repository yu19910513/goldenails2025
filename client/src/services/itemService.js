import Service from "./service";

/**
 * A service class for managing services.
 */
class ItemService extends Service {
  /**
   * Retrieves a list of all available services.
   * 
   * @returns {Promise<Array<Object>>} A promise resolving to an array of service objects.
   */
  getAll() {
    return this.http.get("/services/");
  }
}

export default new ItemService();
