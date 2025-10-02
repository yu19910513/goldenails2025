const express = require("express");
const router = express.Router();
const { Technician, Category, Appointment, Service, Customer } = require("../../models");
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

/**
 * @route GET /schedule
 * @description Fetches the daily schedule. It returns all **active** technicians and their associated **non-deleted** appointments for a given date. Technicians with no appointments for that day are still included with an empty appointments array, ensuring a complete roster is always returned. Customer information is excluded for privacy.
 *
 * @param {object} req - The Express request object.
 * @param {object} req.query - The query parameters of the request.
 * @param {string} req.query.date - The date for which the schedule is fetched (format: YYYY-MM-DD). This parameter is **required**.
 *
 * @param {object} res - The Express response object.
 *
 * @returns {object[]} res.body - An array of technician objects, each populated with their appointments for the day.
 * @returns {number} res.body[].id - The technician's unique ID.
 * @returns {string} res.body[].name - The technician's name.
 * @returns {object[]} res.body[].Appointments - A list of appointments for the technician. Note: The name is capitalized by Sequelize's default. This array will be empty if the technician has no appointments on the given date.
 * @returns {number} res.body[].Appointments[].id - The appointment's unique ID.
 * @returns {string} res.body[].Appointments[].date - The date of the appointment.
 * @returns {object[]} res.body[].Appointments[].Services - A list of services included in the appointment.
 * @returns {number} res.body[].Appointments[].Services[].id - The service's unique ID.
 * @returns {string} res.body[].Appointments[].Services[].name - The name of the service.
 * @returns {number} res.body[].Appointments[].Services[].time - The duration of the service in minutes.
 *
 * @throws {400} If the 'date' query parameter is missing.
 * @throws {500} If there is a server-side error during the database query.
 *
 * @example
 * // Request:
 * fetch('/schedule?date=2025-10-22')
 * .then(response => response.json())
 * .then(data => console.log(data))
 * .catch(error => console.error(error));
 *
 * // Example Response Body:
 * [
 * {
 * "id": 1,
 * "name": "Jane Doe",
 * "Appointments": [
 * {
 * "id": 101,
 * "date": "2025-10-22",
 * "Services": [
 * { "id": 5, "name": "Haircut", "time": 30 },
 * { "id": 8, "name": "Coloring", "time": 90 }
 * ]
 * }
 * ]
 * },
 * {
 * "id": 2,
 * "name": "John Smith",
 * "Appointments": []
 * }
 * ]
 */
router.get("/schedule", async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required." });
    }

    const techniciansWithSchedule = await Technician.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: Appointment,
          required: false,
          where: {
            date: date,
            [Op.or]: [{ note: null }, { note: { [Op.not]: "deleted" } }],
          },
          include: [
            {
              model: Service,
              attributes: ["id", "name", "time"],
              through: { attributes: [] },
            },
          ],
        },
      ],
      where: {
        status: true,
      },
      order: [
        ['name', 'ASC'],
        [Appointment, 'id', 'ASC'],
      ],
    });

    res.status(200).json(techniciansWithSchedule);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error: "Failed to fetch schedule." });
  }
});


module.exports = router;
