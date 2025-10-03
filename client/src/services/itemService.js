import Service from "./service";

/**
 * A service class for managing services.
 */
class ItemService extends Service {
  /**
 * Fetches all non-deprecated services from the API.
 *
 * The services are grouped by category, with each service including
 * its ID, name, description, price, time, and category ID.
 *
 * @function
 * @returns {Promise<import('axios').AxiosResponse<Array<Object>>>} 
 * A promise that resolves to the Axios response containing an array of categories,
 * each with its associated list of services.
 *
 * @example
 * getAll().then(response => {
 *   console.log(response.data);
 *   // [
 *   //   {
 *   //     id: 1,
 *   //     name: "Nails",
 *   //     services: [
 *   //       { id: 101, name: "Manicure", description: "Basic nail cleaning", price: 25, time: 30, category_id: 1 }
 *   //     ]
 *   //   }
 *   // ]
 * });
 */
  getAll() {
    return this.http.get("/services/");
  }
}

export default new ItemService();
