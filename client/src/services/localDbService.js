import Service from "./service";

/**
 * LocalDbService handles API interactions with YAML-based local data files.
 * It provides CRUD operations and nested field manipulation for flexible local data management.
 */
class LocalDbService extends Service {
  /**
   * Creates a new YAML local data file with the given name and initial content.
   *
   * @param {string} name - The name of the data file (without `.yaml`).
   * @param {Object} data - The initial content to be saved.
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>}
   */
  create(name, data) {
    return this.http.post(`/local_db/${name}`, data);
  }

  /**
   * Retrieves the entire content of a YAML local data file.
   *
   * @param {string} name - The name of the file to retrieve.
   * @returns {Promise<import('axios').AxiosResponse<Object>>}
   */
  get(name) {
    return this.http.get(`/local_db/${name}`);
  }

  /**
   * Retrieves a nested value from a YAML local data file.
   *
   * @param {string} name - The name of the file.
   * @param {string[]} pathArray - Array representing the path (e.g., ['app', 'version']).
   * @returns {Promise<import('axios').AxiosResponse<{ value: any }>>}
   */
  getField(name, pathArray) {
    const searchParams = new URLSearchParams();
    pathArray.forEach(p => searchParams.append("path", p));
    return this.http.get(`/local_db/${name}/field?${searchParams.toString()}`);
  }

  /**
   * Overwrites the entire content of a YAML local data file.
   *
   * @param {string} name - The file name.
   * @param {Object} data - New content.
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>}
   */
  update(name, data) {
    return this.http.put(`/local_db/${name}`, data);
  }

  /**
   * Updates a nested field in a YAML local data file.
   *
   * @param {string} name
   * @param {string[]} pathArray
   * @param {*} value
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>}
   */
  updateField(name, pathArray, value) {
    return this.http.patch(`/local_db/${name}/field`, {
      path: pathArray,
      value: value,
    });
  }

  /**
   * Deletes a nested field from a YAML local data file.
   *
   * @param {string} name
   * @param {string[]} pathArray
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>}
   */
  deleteField(name, pathArray) {
    return this.http.delete(`/local_db/${name}/field`, {
      data: { path: pathArray },
    });
  }

  /**
   * Deletes an entire YAML local data file.
   *
   * @param {string} name
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>}
   */
  delete(name) {
    return this.http.delete(`/local_db/${name}`);
  }
}

export default new LocalDbService();
