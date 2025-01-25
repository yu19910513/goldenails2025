const express = require("express");
const router = express.Router();
const { Appointment, Technician, Service } = require("../../models");
const { Op } = require("sequelize");
const { groupAppointments, now, overlap } = require("../../util/util")

/**
 * @route GET /appointments/upcoming
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
router.get("/upcoming", async (req, res) => {
  const { tech_id } = req.query;

  if (!tech_id) {
    return res.status(400).json({ error: "Invalid or missing technician ID." });
  }

  try {
    const appointments = await Appointment.findAll({
      where: {
        date: {
          [Op.gte]: now(), // Exclude appointments with past dates
        },
        [Op.or]: [
          { note: null }, // Include records where note is NULL
          { note: { [Op.not]: "deleted" } }, // Also include records where note is NOT "deleted"
        ],
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
 * GET /:date
 * Fetches appointments for a specified date and groups them by technician.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - Parameters passed in the request URL.
 * @param {string} req.params.date - The date parameter in YYYY-MM-DD format.
 * @param {Object} res - The response object.
 *
 * @returns {void} Responds with a JSON array of grouped appointments by technician.
 * Each technician object includes:
 *  - id: Technician ID
 *  - name: Technician name
 *  - appointments: Array of appointments associated with the technician
 *
 * @throws {Object} Returns a 400 error if the date parameter is missing or invalid.
 * @throws {Object} Returns a 500 error if fetching appointments fails.
 */
router.get("/:date", async (req, res) => {
  try {
    // Extract the date from query parameters
    const { date } = req.params;
    // Validate the date
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required." });
    }
    // Fetch appointments for the specified date
    const appointments = await Appointment.findAll({
      where: {
        date: date
      },
      include: [
        {
          model: Technician,
          attributes: ["id", "name"], // Select relevant technician fields
          through: { attributes: [] }, // Exclude join table details
        },
        {
          model: Service,
          attributes: ["id", "name", "time"], // Include service details
          through: { attributes: [] }, // Exclude join table details
        },
      ],
    });

    // Group appointments by technician
    const groupedByTechnician = appointments.reduce((acc, appointment) => {
      // Ensure the appointment has associated technicians
      if (!appointment.Technicians || appointment.Technicians.length === 0) return acc;

      appointment.Technicians.forEach((technician) => {
        // Check if this technician is already in the accumulator
        if (!acc[technician.id]) {
          acc[technician.id] = {
            id: technician.id,
            name: technician.name,
            appointments: [],
          };
        }

        // Add the appointment to the technician's appointments array
        acc[technician.id].appointments.push(appointment);
      });

      return acc;
    }, {});

    // Convert grouped data into an array
    const groupedArray = Object.values(groupedByTechnician);

    res.status(200).json(groupedArray);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments." });
  }
});


/**
 * @route GET /customer_history
 * @description Fetches all non-deleted appointments for a specific customer.
 * @param {Object} req - Express request object.
 * @param {Object} req.query - Query parameters.
 * @param {string} req.query.customer_id - The ID of the customer whose appointments are being fetched.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with grouped appointment data or an error message.
 * @throws {400} If the customer_id is missing or invalid.
 * @throws {500} If there is an error retrieving appointments from the database.
 */
router.get("/customer_history", async (req, res) => {
  const { customer_id } = req.query;

  if (!customer_id) {
    return res.status(400).json({ error: "Invalid or missing customer ID." });
  }

  try {
    const appointments = await Appointment.findAll({
      where: {
        customer_id: customer_id,
        [Op.or]: [
          { note: null }, // Include records where note is NULL
          { note: { [Op.not]: "deleted" } }, // Also include records where note is NOT "deleted"
        ],
      },
      include: [
        {
          model: Technician,
          attributes: ["id", "name"], // Select relevant technician fields
          through: { attributes: [] }, // Exclude join table details
        },
        {
          model: Service,
          attributes: ["id", "name", "time", "price"], // Include service duration for calculations
          through: { attributes: [] }, // Exclude join table details
        },
      ],
    });
    res.status(200).json(groupAppointments(appointments));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments." });
  }
});


/**
 * @route PUT /appointment/update_note
 * @description Updates the note field of a specific appointment
 * @param {object} req - Express request object
 * @param {number} req.body.id - The ID of the appointment to be updated
 * @param {string} req.body.note - The new note to set for the appointment
 * @param {object} res - Express response object
 * @returns {object} JSON response indicating success or failure
 */
router.put("/update_note", async (req, res) => {
  const { id, note } = req.body;

  if (!id || !note) {
    return res.status(400).json({ error: "Invalid or missing appointment ID or note." });
  }

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    // Update note field
    appointment.note = note;
    await appointment.save();

    res.status(200).json({ message: "Appointment note updated successfully." });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Failed to update appointment." });
  }
});


/**
 * POST / Create a new appointment.
 *
 * This endpoint creates a new appointment by validating the input data,
 * ensuring there are no time conflicts with existing appointments, and 
 * associating the appointment with the specified services and technicians.
 *
 * @async
 * @function
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {number} req.body.customer_id - ID of the customer making the appointment.
 * @param {string} req.body.date - The date of the appointment in YYYY-MM-DD format.
 * @param {string} req.body.start_service_time - Start time of the appointment in HH:MM format.
 * @param {number} req.body.technician_id - ID of the technician assigned to the appointment.
 * @param {number[]} req.body.service_ids - Array of service IDs included in the appointment.
 * @param {Object} res - The response object.
 * 
 * @returns {Object} The created appointment object or an error message.
 *
 * @throws {400 Bad Request} If required fields are missing, have invalid formats, or if the new appointment overlaps with an existing one.
 * @throws {500 Internal Server Error} If an unexpected error occurs during processing.
 *
 * @example
 * // Request Body:
 * {
 *   "customer_id": 123,
 *   "date": "2025-01-25",
 *   "start_service_time": "14:00",
 *   "technician_id": [456],
 *   "service_ids": [1, 2, 3]
 * }
 *
 * // Response (201 Created):
 * {
 *   "id": 789,
 *   "customer_id": 123,
 *   "date": "2025-01-25",
 *   "start_service_time": "14:00",
 *   "createdAt": "2025-01-25T12:00:00Z",
 *   "updatedAt": "2025-01-25T12:00:00Z"
 * }
 *
 * // Error (400 Bad Request):
 * {
 *   "message": "Appointment overlaps with an existing appointment.",
 *   "conflictingSlot": "14:00"
 * }
 *
 * // Error (500 Internal Server Error):
 * {
 *   "message": "Internal server error."
 * }
 */
router.post("/", async (req, res) => {
  const { customer_id, date, start_service_time, technician_id, service_ids } = req.body;

  try {
    // Validate date and start_service_time
    if (!date || !start_service_time) {
      return res.status(400).json({ message: "Date and start service time are required." });
    }

    // Combine date and time into a single Date object
    const start_service_time_obj = new Date(`${date}T${start_service_time}`);
    if (isNaN(start_service_time_obj.getTime())) {
      return res.status(400).json({ message: "Invalid date or time format." });
    }

    // Fetch service times for the new appointment
    const services = await Service.findAll({
      where: { id: service_ids },
      attributes: ["id", "time"], // Using "time" instead of "duration"
    });

    if (!services || services.length !== service_ids.length) {
      return res.status(400).json({ message: "Some services are invalid or not found." });
    }

    const totalServiceTime = services.reduce((sum, service) => sum + service.time, 0);
    const end_service_time = new Date(start_service_time_obj.getTime() + totalServiceTime * 60000);

    // Fetch all existing appointments for the technician on the same date
    const existingAppointments = await Appointment.findAll({
      include: [
        {
          model: Technician,
          where: { id: technician_id },
        },
        {
          model: Service,
          attributes: ["time"], // Fetch service times for each appointment
          through: { attributes: [] }, // Exclude through table attributes
        },
      ],
      where: {
        date,
        [Op.or]: [
          { note: null }, // Include records where note is NULL
          { note: { [Op.not]: "deleted" } }, // Also include records where note is NOT "deleted"
        ],
      },
    });

    // Check if the new appointment overlaps 
    if (
      overlap(existingAppointments, start_service_time_obj, end_service_time)
    ) {
      return res.status(400).json({
        message: "Appointment overlaps with an existing appointment.",
        conflictingSlot: start_service_time,
      });
    }

    // Create the new appointment
    const newAppointment = await Appointment.create({
      customer_id,
      date,
      start_service_time,
    });

    // Associate the new appointment with technicians
    if (technician_id && technician_id.length > 0) {
      await newAppointment.addTechnicians(technician_id);
    }

    // Associate the new appointment with services
    if (service_ids && service_ids.length > 0) {
      await newAppointment.addServices(service_ids);
    }

    // Return the newly created appointment
    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});




module.exports = router;
