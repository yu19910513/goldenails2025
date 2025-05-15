import Service from "./service";

/**
 * A service class for managing technicians.
 */
class TechnicianService extends Service {
  /**
   * Retrieves a list of all technicians.
   * 
   * @returns {Promise<Array<Object>>} A promise resolving to an array of technician objects.
   */
  getAll() {
    return this.http.get("/technicians/");
  }

  /**
   * Retrieves a list of available technicians based on selected category IDs.
   * 
   * @param {Array<number|string>} categoryIds - A list of category IDs to filter available technicians.
   * @returns {Promise<Array<Object>>} A promise resolving to an array of available technician objects.
   */
  getAvailableTechnicians(categoryIds) {
    return this.http.post("/technicians/available", { categoryIds });
  }
}

export default new TechnicianService();
