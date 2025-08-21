const express = require("express");
const router = express.Router();
const { Technician, Service, Category } = require("../../models");
const { Sequelize, Op } = require("sequelize");

/**
 * @summary Get all active technicians
 * @route GET /
 * @description Retrieves a list of all technicians whose status is 'true'.
 * It returns a simplified object for each technician, containing only their ID, name, and description.
 * @access Public
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 *
 * @returns {void} Sends a JSON response. On success, it sends a 200 status with an array
 * of technician objects. On failure, it sends a 500 status with an error object.
 *
 * @example
 * // Request URL:
 * // GET /api/technicians
 *
 * // Success Response (200):
 * [
 * {
 * "id": 1,
 * "name": "John Doe",
 * "description": "Plumbing Technician"
 * },
 * {
 * "id": 2,
 * "name": "Jane Smith",
 * "description": "Electrical Technician"
 * }
 * ]
 *
 * // Error Response (500):
 * {
 * "error": "Failed to retrieve technicians"
 * }
 */
router.get("/", async (req, res) => {
  try {
    const technicianRawData = await Technician.findAll({
      where: {
        status: true, // Only include records where status is true
      },
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
 * @route POST /technicians/available
 * @description Retrieves a list of technicians who can perform services in all specified categories.
 *
 * @param {Object} req - Express request object
 * @param {Array<number>} req.body.categoryIds - An array of category IDs the technician must support
 *
 * @returns {Object} 200 - An array of matching technician objects
 * @returns {Object} 400 - Bad request if categoryIds is missing or invalid
 * @returns {Object} 500 - Internal server error on failure
 *
 * @example
 * Request Body:
 * {
 *   "categoryIds": [1, 5]
 * }
 *
 * Successful Response:
 * [
 *   {
 *     "id": 3,
 *     "name": "Alice",
 *     "description": "Expert in nails",
 *     "phone": "123-456-7890",
 *     "unavailability": "...",
 *     "categoryCount": "2"
 *   }
 * ]
 */

router.post("/available", async (req, res) => {
  try {
    const { categoryIds } = req.body;
    
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ message: "Category IDs are required." });
    }

    const technicians = await Technician.findAll({
      include: [
        {
          model: Category,
          where: { id: categoryIds },
          through: { attributes: [] },
          attributes: [], // Avoid selecting category fields to keep query clean
        },
      ],
       where: {
        status: true, // Only include records where status is true
      },
      attributes: [
        "id",
        "name",
        "description",
        "phone",
        "unavailability",
        [Sequelize.fn("COUNT", Sequelize.fn("DISTINCT", Sequelize.col("Categories.id"))), "categoryCount"]
      ],
      group: [
        "Technician.id",
        "Technician.name",
        "Technician.description",
        "Technician.phone",
        "Technician.unavailability"
      ],
      having: Sequelize.literal(`COUNT(DISTINCT Categories.id) = ${categoryIds.length}`),
    });

    return res.status(200).json(technicians);
  } catch (error) {
    console.error("Error fetching available technicians:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
