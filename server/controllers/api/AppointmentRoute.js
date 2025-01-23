const express = require("express");
const router = express.Router();
const { Appointment, Technician, Service} = require("../../models");
const { Op } = require("sequelize");

/**
 * @route GET /upcoming
 * @description Fetches upcoming appointments for a specified technician.
 * @param {Object} req - Express request object.
 * @param {string} req.query.tech_id - The ID of the technician whose appointments are to be fetched.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response containing the list of upcoming appointments or an error message.
 * 
 * @throws {400} - Invalid or missing technician ID in the request query.
 * @throws {500} - Internal server error if fetching appointments fails.
 * 
 * @example
 * // Request
 * GET /upcoming?tech_id=123
 * 
 * // Success Response
 * HTTP/1.1 200 OK
 * [
 *   {
 *     "id": 1,
 *     "date": "2025-01-23T14:00:00Z",
 *     "Technician": {
 *       "id": 123,
 *       "name": "John Doe"
 *     },
 *     "Services": [
 *       {
 *         "id": 45,
 *         "name": "Haircut",
 *         "time": 30
 *       }
 *     ]
 *   }
 * ]
 * 
 * @example
 * // Error Response
 * HTTP/1.1 400 Bad Request
 * { "error": "Invalid or missing technician ID." }
 * 
 * HTTP/1.1 500 Internal Server Error
 * { "error": "Failed to fetch appointments." }
 */
router.get("/upcoming ", async (req, res) => {
  const { tech_id } = req.query;

  if (!tech_id) {
    return res.status(400).json({ error: "Invalid or missing technician ID." });
  }

  try {
    const appointments = await Appointment.findAll({
      where: {
        date: {
          [Op.gte]: new Date(), // Exclude appointments with past dates
        },
      },
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

/**
 * @route POST /
 * @description Create a new appointment for a customer
 * @access Public
 * 
 * @param {Object} req - The request object containing the appointment data.
 * @param {Object} res - The response object used to send the status and result.
 * 
 * @returns {Object} - Returns the newly created appointment or an error message.
 * 
 * @throws {400} - If an appointment already exists for the same date and start service time.
 * @throws {500} - If there is an internal server error during the creation process.
 */
router.post("/", async (req, res) => {
  const { customer_id, date, start_service_time, technician_id, service_ids } = req.body;

  try {
    // Check if the appointment already exists for the same date and time
    const existingAppointment = await Appointment.findOne({
      where: {
        date: date,
        start_service_time: start_service_time,
      },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "Appointment already exists for the selected time." });
    }

    // Create a new appointment record
    const newAppointment = await Appointment.create({
      customer_id,
      date,
      start_service_time,
    });

    // Associate the appointment with technicians (many-to-many through AppointmentTechnician)
    if (technician_id && technician_id.length > 0) {
      await newAppointment.addTechnicians(technician_id); // This will create records in the AppointmentTechnician table
    }

    // Associate the appointment with services (many-to-many through AppointmentService)
    if (service_ids && service_ids.length > 0) {
      await newAppointment.addServices(service_ids); // This will create records in the AppointmentService table
    }

    
    // Return the newly created appointment
    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


module.exports = router;
