import Service from "./service";

/**
 * A service class for managing miscellaneous items or data.
 *
 * Inherits common HTTP utilities from the base Service class.
 */
class MiscellaneousService extends Service {
  /**
   * Fetches miscellaneous data based on the provided title.
   * 
   * This method sends a GET request to retrieve miscellaneous data from the server,
   * using the provided title as a query parameter.
   * 
   * @param {string} title - The title of the miscellaneous data to search for.
   * @returns {Promise<import('axios').AxiosResponse<Object>>} A promise that resolves to the response from the server.
   * 
   * @example
   * find("Sample Title")
   *   .then(response => {
   *     console.log(response.data);
   *   })
   *   .catch(error => {
   *     console.error(error);
   *   });
   */
  find(title) {
    return this.http.get(`/miscellaneouses/key?title=${title}`);
  }
  
  /**
   * Fetches all miscellaneous data from the server.
   *
   * Sends a GET request to the `/miscellaneouses/all` endpoint.
   *
   * @returns {Promise<import('axios').AxiosResponse<Object>>} A promise that resolves to the server response containing all miscellaneous items.
   */
  getAll() {
    return this.http.get(`/miscellaneouses/all`);
  }
}

export default new MiscellaneousService();
