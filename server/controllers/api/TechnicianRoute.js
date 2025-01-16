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
 * @route POST /available
 * @description Fetches technicians capable of performing all the services specified by the provided service IDs.
 * @access Public
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request, which should contain the service IDs.
 * @param {Array} req.body.serviceIds - An array of service IDs that the technicians must be capable of performing.
 * 
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON response containing either a list of technicians or an error message.
 * 
 * @throws {400} - If `serviceIds` is missing, not an array, or empty. Example: { message: "Service IDs are required." }
 * @throws {500} - If there is an internal server error (e.g., database failure). Example: { message: "Internal server error." }
 * 
 * @example
 * // Request:
 * POST /available
 * {
 *   "serviceIds": [1, 2, 3]
 * }
 * 
 * // Success Response:
 * [
 *   {
 *     "id": 1,
 *     "name": "John Doe",
 *     "category": "Plumbing"
 *   },
 *   {
 *     "id": 2,
 *     "name": "Jane Smith",
 *     "category": "Electrical"
 *   }
 * ]
 * 
 * // Error Response (400):
 * {
 *   "message": "Service IDs are required."
 * }
 * 
 * // Error Response (500):
 * {
 *   "message": "Internal server error."
 * }
 */
router.post("/available", async (req, res) => {
  try {
    const { serviceIds } = req.body;
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ message: "Service IDs are required." });
    }

    // Fetch technicians capable of performing all the selected services
    const technicians = await Technician.findAll({
      include: [
        {
          model: Category,
          through: { attributes: [] }, // Exclude join table attributes
          include: [
            {
              model: Service,
              where: { id: serviceIds },
              attributes: [], // Exclude Service attributes from the result
            },
          ],
        },
      ],
      group: ["Technician.id"],
      having: Sequelize.literal(`COUNT(DISTINCT Categories.id) = ${serviceIds.length}`), // Ensure all services are matched
    });
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
