const express = require("express");
const router = express.Router();
const { Technician, Service, Category } = require("../../models");
const { Sequelize, Op } = require("sequelize");


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

    // Log the result for debugging purposes
    console.log(technicians);

    return res.status(200).json(technicians);
  } catch (error) {
    console.error("Error fetching available technicians:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});






// GET a single technician by ID
router.get("/:id", async (req, res) => {
  try {
    const technician = await Technician.findByPk(req.params.id);
    if (!technician) return res.status(404).json({ error: "Technician not found" });
    res.status(200).json(technician);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve the technician" });
  }
});

// POST a new technician
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const newTechnician = await Technician.create({ name });
    res.status(201).json(newTechnician);
  } catch (err) {
    res.status(500).json({ error: "Failed to create technician" });
  }
});

// PUT to update a technician by ID
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const updatedTechnician = await Technician.update({ name }, { where: { id: req.params.id } });
    if (!updatedTechnician[0]) return res.status(404).json({ error: "Technician not found" });
    res.status(200).json({ message: "Technician updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update technician" });
  }
});

// DELETE a technician by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedTechnician = await Technician.destroy({ where: { id: req.params.id } });
    if (!deletedTechnician) return res.status(404).json({ error: "Technician not found" });
    res.status(200).json({ message: "Technician deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete technician" });
  }
});

module.exports = router;
