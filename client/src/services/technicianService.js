import Service from "./service";

/**
 * A service class for managing technicians.
 */
class TechnicianService extends Service {
  /**
   * Retrieves a list of all ACTIVE technicians from the API.
   *
   * @returns {Promise<Technician[]>} A promise that resolves to an array of active technician objects.
   * @throws {Error} Throws an error if the network request fails.
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

  /**
  * Retrieves the daily schedule for all technicians for a specific date.
  *
  * @param {string} date - The date for which to fetch the schedule, in 'YYYY-MM-DD' format.
  * @returns {Promise<any>} A promise that resolves with the full HTTP response from the server. The schedule data, an array of technician objects, is typically found in the `data` property of the resolved object.
  * @throws {Error} Rejects the promise if the network request fails or the server returns an error.
  * @example
  * // Assuming 'apiService' is an instance of the class containing this method
  * apiService.getScheduleByDate('2025-10-22')
  * .then(response => {
  * console.log('Schedule for 2025-10-22:', response.data);
  * })
  * .catch(error => {
  * console.error('Failed to fetch schedule:', error);
  * });
  */
  getScheduleByDate(date) {
    return this.http.get("/technicians/schedule", { params: { date } });
  }
}



export default new TechnicianService();
