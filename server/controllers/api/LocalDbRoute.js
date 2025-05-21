const express = require("express");
const router = express.Router();

const localDb = require("../../local_db");

/**
 * @route POST /local_db/:name
 * @summary Create a new YAML configuration file
 * @param {express.Request} req - Express request object
 * @param {express.Response} res - Express response object
 * @returns {201: { message: string }, 400: { error: string }}
 * 
 * @example
 * POST /local_db/app_config
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
 * @route GET /local_db/:name
 * @summary Get the entire content of a YAML configuration file
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {200: Object, 404: { error: string }}
 * 
 * @example
 * GET /local_db/app_config
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
 * @route PUT /local_db/:name
 * @summary Overwrite an entire YAML file with new content
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {200: { message: string }, 400: { error: string }}
 * 
 * @example
 * PUT /local_db/app_config
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
 * @route GET /local_db/:name/field
 * @summary Get a nested field value from a YAML file
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {200: { value: any }, 400: { error: string }, 404: { error: string }}
 * 
 * @example
 * GET /local_db/app_config/field?path=app&path=name
 */
router.get("/:name/field", (req, res) => {
    const { name } = req.params;
    let path = req.query.path;

    if (!path) {
        return res.status(400).json({ error: "`path` query param is required" });
    }

    if (!Array.isArray(path)) {
        path = path.split(',');
    }

    try {
        const value = localDb.getYamlField(name, path);
        res.json({ value });
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

/**
 * @route PATCH /local_db/:name/field
 * @summary Update a nested field in a YAML file
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {200: { message: string }, 400: { error: string }}
 * 
 * @example
 * PATCH /local_db/app_config/field
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
 * @route DELETE /local_db/:name/field
 * @summary Delete a nested field from a YAML file
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {200: { message: string }, 400: { error: string }}
 * 
 * @example
 * DELETE /local_db/app_config/field
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
 * @route DELETE /local_db/:name
 * @summary Delete an entire YAML configuration file
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {200: { message: string }, 404: { error: string }}
 * 
 * @example
 * DELETE /local_db/app_config
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
