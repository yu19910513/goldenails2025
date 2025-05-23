const express = require("express");
const dotenv = require('dotenv');
const router = express.Router();
const { Miscellaneous } = require("../../models");
const { authorizeAdmin } = require("../../utils/authentication");
dotenv.config();


/**
 * Retrieves miscellaneous data based on the provided title.
 * 
 * This endpoint searches for miscellaneous data using the title query parameter,
 * and returns the `title` and `context` attributes of the matching record.
 * If no matching data is found, it returns a 404 status with an appropriate message.
 * In case of any server errors, a 500 status code is returned.
 * 
 * @route GET /key
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters sent in the request.
 * @param {string} req.query.title - The title of the miscellaneous data to search for.
 * @param {Object} res - The response object.
 * @returns {Object} JSON response containing the `title` and `context` of the found miscellaneous data.
 * @returns {Object} res.body - The miscellaneous data object.
 * @returns {string} res.body.title - The title of the miscellaneous data.
 * @returns {string} res.body.context - The context of the miscellaneous data.
 * @throws {Object} 404 - If no matching miscellaneous data is found.
 * @throws {Object} 500 - If there is an error while searching for the data.
 * 
 * @example
 * // Example of the response when found
 * {
 *   "title": "Sample Title",
 *   "context": "Sample context content"
 * }
 * 
 * @example
 * // Example of the response when not found
 * {
 *   "message": "This miscellaneous data is not found."
 * }
 */
router.get(`/key`, async (req, res) => {
  try {
    let { title } = req.query;

    // Validate `title`
    if (!title || typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({ error: "Invalid or missing 'title' parameter." });
    }

    title = title.trim(); // Trim whitespace to avoid unnecessary mismatches

    const miscellaneous = await Miscellaneous.findOne({
      where: { title },
      attributes: ["title", "context"], // Only retrieves `title` and `context`
    });

    if (!miscellaneous) {
      return res.status(404).json({ message: "This miscellaneous data is not found." });
    }

    res.json(miscellaneous);
  } catch (error) {
    console.error("Error searching miscellaneous data:", error.stack || error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

/**
 * GET / - Retrieve all miscellaneous data entries.
 *
 * This endpoint returns a list of all available miscellaneous data entries.
 * It requires admin authorization and responds with each entry's `title` and `context`.
 *
 * @route GET /
 * @middleware authorizeAdmin - Ensures the user is authorized as an admin.
 * @returns {Object[]} 200 - An array of miscellaneous data objects.
 * @returns {string} 200[].title - The title of the miscellaneous data.
 * @returns {string} 200[].context - The context of the miscellaneous data.
 * @throws {404} - If no data is found.
 * @throws {500} - If there is a server error while fetching the data.
 *
 * @example
 * // Successful response
 * [
 *   {
 *     "title": "Policy Update",
 *     "context": "New policy changes effective next month."
 *   },
 *   {
 *     "title": "Maintenance Notice",
 *     "context": "System maintenance scheduled for Friday at 10 PM."
 *   }
 * ]
 *
 * @example
 * // When no data is found
 * {
 *   "message": "No data found."
 * }
 *
 * @example
 * // On internal server error
 * {
 *   "error": "An internal server error occurred."
 * }
 */
router.get('/', authorizeAdmin, async (req, res) => {
  try {
    const miscellaneous = await Miscellaneous.findAll({
      attributes: ['title', 'context'],
    });

    if (miscellaneous.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

    res.json(miscellaneous);
  } catch (error) {
    console.error("Error fetching miscellaneous data:", error.stack || error);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});




module.exports = router;
