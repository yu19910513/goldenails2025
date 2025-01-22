const express = require("express");
const router = express.Router();
const { Appointment, Technician, Service } = require("../../models");

/**
 * @route GET /appointments/search
 * @description Fetch appointments for a specific technician using their technician ID.
 * @queryParam {string} tech_id - The technician's ID to search for appointments.
 * 
 * @returns {Object} 200 - A list of appointments that match the technician ID.
 * @returns {Object} 400 - If the technician ID is missing or invalid.
 * @returns {Object} 500 - If an error occurs while fetching the appointments.
 * 
 * @example
 * // Example request:
 * GET /appointments/search?tech_id=123
 * 
 * // Example response (200 OK):
 * [
 *   {
 *     "id": 1,
 *     "date": "2023-12-01",
 *     "start_service_time": "09:00",
 *     "services": [
 *       { "id": 1, "name": "Service 1", "time": 30 },
 *       { "id": 2, "name": "Service 2", "time": 45 }
 *     ],
 *     "technician": { "id": 123, "name": "Technician Name" }
 *   }
 * ]
 * 
 * @example
 * // Example response (400 Bad Request):
 * {
 *   "error": "Invalid or missing technician ID."
 * }
 * 
 * @example
 * // Example response (500 Internal Server Error):
 * {
 *   "error": "Failed to fetch appointments."
 * }
 */
router.get("/search", async (req, res) => {
  const { tech_id } = req.query;

  if (!tech_id) {
    return res.status(400).json({ error: "Invalid or missing technician ID." });
  }

  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Technician,
          attributes: ["id", "name"], // Select relevant technician fields
          through: { attributes: [] }, // Exclude join table details
          where: { id: tech_id },  // Use tech_id instead of id
        },
        {
          model: Service,
          attributes: ["id", "name", "time"], // Include service duration for calculations
          through: { attributes: [] }, // Exclude join table details
        },
      ],
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments." });
  }
});


module.exports = router;
