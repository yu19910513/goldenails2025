const express = require("express");
const router = express.Router();
const { Technician, Service, Category } = require("../../models");
const { Sequelize, Op } = require("sequelize");

/**
 * @route GET /
 * @description Retrieves a list of all technicians with basic details (id, name, description).
 * @access Public
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON response containing an array of technician data.
 * 
 * @throws {500} - If there is an internal server error (e.g., database failure). Example: { error: "Failed to retrieve technicians" }
 * 
 * @example
 * // Request:
 * GET /
 * 
 * // Success Response:
 * [
 *   {
 *     "id": 1,
 *     "name": "John Doe",
 *     "description": "Plumbing Technician"
 *   },
 *   {
 *     "id": 2,
 *     "name": "Jane Smith",
 *     "description": "Electrical Technician"
 *   }
 * ]
 * 
 * // Error Response (500):
 * {
 *   "error": "Failed to retrieve technicians"
 * }
 */
router.get("/", async (req, res) => {
  try {
    const technicianRawData = await Technician.findAll({
      attributes: ["id", "name", "description"], // Service attributes
    });
    // Serialize the data
    const technicianData = technicianRawData.map((technician) =>
      technician.get({ plain: true })
    );
    res.status(200).json(technicianData);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve technicians" });
  }
});


/**
 * POST /available
 * 
 * Endpoint to fetch technicians who can perform services across all the specified categories.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {Array<number>} req.body.categoryIds - An array of category IDs to filter technicians by.
 * @param {Object} res - The response object.
 * 
 * @returns {Object} JSON response with either:
 *  - A 200 status code and a list of technicians matching the criteria, or
 *  - A 400 status code if the request body is invalid, or
 *  - A 500 status code if an internal server error occurs.
 * 
 * @throws {Error} - Logs any unexpected errors during execution.
 * 
 * Example Request:
 * {
 *   "categoryIds": [1, 2, 3]
 * }
 * 
 * Example Successful Response:
 * [
 *   {
 *     "id": 1,
 *     "name": "Technician A",
 *     "categories": [
 *       { "id": 1, "name": "Category 1" },
 *       { "id": 2, "name": "Category 2" }
 *     ]
 *   },
 *   {
 *     "id": 2,
 *     "name": "Technician B",
 *     "categories": [
 *       { "id": 1, "name": "Category 1" },
 *       { "id": 2, "name": "Category 2" },
 *       { "id": 3, "name": "Category 3" }
 *     ]
 *   }
 * ]
 * 
 * Example Error Responses:
 * - 400: { "message": "Category IDs are required." }
 * - 500: { "message": "Internal server error." }
 */

router.post("/available", async (req, res) => {
  try {
    const { categoryIds } = req.body;

    // Validate the request body
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ message: "Category IDs are required." });
    }

    // Fetch technicians capable of performing services in all the selected categories
    const technicians = await Technician.findAll({
      include: [
        {
          model: Category,
          where: { id: categoryIds }, // Match the provided category IDs
          through: { attributes: [] }, // Exclude join table attributes
        },
      ],
      group: ["Technician.id"],
      having: Sequelize.literal(`COUNT(DISTINCT Categories.id) = ${categoryIds.length}`), // Ensure all categories are matched
    });

    return res.status(200).json(technicians);
  } catch (error) {
    console.error("Error fetching available technicians:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
