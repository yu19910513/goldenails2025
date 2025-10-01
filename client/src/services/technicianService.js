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
}

/**
   * Retrieves the daily schedule, including all technicians and their appointments for a specific date.
   *
   * @param {string} date - The date for which to fetch the schedule, in 'YYYY-MM-DD' format.
   * @returns {Promise<object[]>} A promise that resolves to an array of technician objects, each containing their appointments for the day.
   * @throws {Error} Throws an error if the network request fails.
   */
getScheduleByDate(date) {
  return this.http.get("/schedule", { params: { date } });
}

export default new TechnicianService();
