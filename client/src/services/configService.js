import Service from "./service";

/**
 * ConfigService handles API interactions with YAML-based configuration files.
 * It provides CRUD operations as well as nested field manipulation for flexible configuration management.
 */
class ConfigService extends Service {
  /**
   * Creates a new YAML configuration file with the given name and initial data.
   * Fails if a file with the same name already exists.
   *
   * @param {string} name - The name of the config file (without `.yaml`).
   * @param {Object} data - The initial content to be saved in the config file.
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>} Axios response containing success message.
   *
   * @example
   * ConfigService.createConfig("app_config", { app: { version: "1.0" } });
   */
  createConfig(name, data) {
    return this.http.post(`/configs/${name}`, data);
  }

  /**
   * Retrieves the contents of a YAML configuration file and parses it into a JavaScript object.
   *
   * @param {string} name - The name of the config file to retrieve.
   * @returns {Promise<import('axios').AxiosResponse<Object>>} Axios response containing the config data.
   *
   * @example
   * ConfigService.getConfig("app_config").then(res => console.log(res.data));
   */
  getConfig(name) {
    return this.http.get(`/configs/${name}`);
  }

  /**
   * Completely replaces the contents of an existing YAML configuration file.
   *
   * @param {string} name - The name of the config file to update.
   * @param {Object} data - The full content to overwrite the file with.
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>} Axios response containing success message.
   *
   * @example
   * ConfigService.updateConfig("app_config", { app: { version: "2.0" } });
   */
  updateConfig(name, data) {
    return this.http.put(`/configs/${name}`, data);
  }

  /**
   * Updates a specific nested field within a YAML config file.
   * Intermediate objects in the path will be created if they do not exist.
   *
   * @param {string} name - The name of the config file.
   * @param {string[]} pathArray - Array representing the nested key path (e.g., ['app', 'version']).
   * @param {*} value - The value to assign to the given path.
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>} Axios response with update confirmation.
   *
   * @example
   * ConfigService.updateField("app_config", ["app", "version"], "3.0");
   */
  updateField(name, pathArray, value) {
    return this.http.patch(`/configs/${name}/field`, {
      path: pathArray,
      value: value,
    });
  }

  /**
   * Deletes a specific nested field from a YAML config file.
   * If the path does not exist, an error will be thrown.
   *
   * @param {string} name - The config file name.
   * @param {string[]} pathArray - Array representing the path to the field to be deleted.
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>} Axios response with deletion confirmation.
   *
   * @example
   * ConfigService.deleteField("app_config", ["app", "deprecatedSetting"]);
   */
  deleteField(name, pathArray) {
    return this.http.delete(`/configs/${name}/field`, {
      data: { path: pathArray },
    });
  }

  /**
   * Deletes an entire YAML configuration file from the backend.
   *
   * @param {string} name - The name of the config file to remove.
   * @returns {Promise<import('axios').AxiosResponse<{ message: string }>>} Axios response confirming deletion.
   *
   * @example
   * ConfigService.deleteConfig("app_config");
   */
  deleteConfig(name) {
    return this.http.delete(`/configs/${name}`);
  }
}

export default new ConfigService();
