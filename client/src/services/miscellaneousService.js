import http from "../common/NodeCommon";

/**
 * A service class for managing miscellaneous items or data.
 */
class MiscellaneousService {

  /**
   * Fetches miscellaneous data based on the provided title.
   * 
   * This method sends a GET request to retrieve miscellaneous data from the server,
   * using the provided title as a query parameter. It expects the response to contain
   * the matching data or an error message if not found.
   * 
   * @param {string} title - The title of the miscellaneous data to search for.
   * @returns {Promise<Object>} A promise that resolves to the response from the server,
   * which will contain the miscellaneous data or an error message.
   * 
   * @example
   * // Example of how to use the `find` method
   * find("Sample Title")
   *   .then(response => {
   *     console.log(response.data); // Handles the response data
   *   })
   *   .catch(error => {
   *     console.error(error); // Handles errors
   *   });
   */
  find(title) {
    return http.get(`/miscellaneouses/key?title=${title}`);
  }

  getAll() {
    const token = localStorage.getItem("token");
    return http.get(`/miscellaneouses/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

}

export default new MiscellaneousService();
