const express = require("express");
const router = express.Router();

const localDb = require("../../local_db"); // Automatically uses index.js

/**
 * @route POST /api/config/:name
 * @summary Creates a new YAML configuration file
 * @param {string} name - The name of the YAML file (without extension)
 * @body {Object} initialData - Initial data to populate the YAML file
 * @returns {201|400} Success or error if file exists or input is invalid
 * 
 * @example
 * POST /api/config/app_config
 * Body:
 * {
 *   "app": { "name": "MyApp", "version": "1.0" }
 * }
 */
router.post("/:name", (req, res) => {
    const { name } = req.params;
    const initialData = req.body;

    try {
        localDb.createYamlFile(name, initialData);
        res.status(201).json({ message: `Config '${name}' created.` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @route GET /api/config/:name
 * @summary Reads and returns the content of a YAML configuration file
 * @param {string} name - Name of the YAML file (without extension)
 * @returns {200|404} YAML file content or not found
 * 
 * @example
 * GET /api/config/app_config
 */
router.get("/:name", (req, res) => {
    const { name } = req.params;

    try {
        const data = localDb.readYaml(name);
        res.json(data);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

/**
 * @route PUT /api/config/:name
 * @summary Overwrites the entire content of a YAML file
 * @param {string} name - Name of the file to update
 * @body {Object} newData - Full new content to write into the file
 * @returns {200|400} Success or error
 * 
 * @example
 * PUT /api/config/app_config
 * Body:
 * {
 *   "app": { "name": "NewApp", "version": "2.0" }
 * }
 */
router.put("/:name", (req, res) => {
    const { name } = req.params;
    const newData = req.body;

    try {
        localDb.writeYaml(name, newData);
        res.json({ message: `Config '${name}' updated.` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @route PATCH /api/config/:name/field
 * @summary Updates a nested field in a YAML file using a path array
 * @param {string} name - Config file name
 * @body {string[]} path - Array representing the nested path
 * @body {*} value - Value to assign at the given path
 * @returns {200|400} Success or validation error
 * 
 * @example
 * PATCH /api/config/app_config/field
 * Body:
 * {
 *   "path": ["server", "port"],
 *   "value": 8080
 * }
 */
router.patch("/:name/field", (req, res) => {
    const { name } = req.params;
    const { path, value } = req.body;

    if (!Array.isArray(path)) {
        return res.status(400).json({ error: "`path` must be an array of keys" });
    }

    try {
        localDb.updateYamlField(name, path, value);
        res.json({ message: `Field updated in '${name}'` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @route DELETE /api/config/:name/field
 * @summary Deletes a nested field in a YAML file
 * @param {string} name - Config file name
 * @body {string[]} path - Path to the field to delete
 * @returns {200|400} Success or error if path doesn't exist
 * 
 * @example
 * DELETE /api/config/app_config/field
 * Body:
 * {
 *   "path": ["features", "enableLogging"]
 * }
 */
router.delete("/:name/field", (req, res) => {
    const { name } = req.params;
    const { path } = req.body;

    if (!Array.isArray(path)) {
        return res.status(400).json({ error: "`path` must be an array of keys" });
    }

    try {
        localDb.deleteYamlField(name, path);
        res.json({ message: `Field deleted from '${name}'` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @route DELETE /api/config/:name
 * @summary Deletes an entire YAML configuration file
 * @param {string} name - Name of the YAML file to delete
 * @returns {200|404} Success or not found error
 * 
 * @example
 * DELETE /api/config/app_config
 */
router.delete("/:name", (req, res) => {
    const { name } = req.params;

    try {
        localDb.deleteYamlFile(name);
        res.json({ message: `Config '${name}' deleted.` });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

module.exports = router;
