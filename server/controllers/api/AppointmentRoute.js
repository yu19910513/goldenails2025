const express = require("express");
const router = express.Router();
const { Appointment, Technician, Service, Customer } = require("../../models");
const { Op, fn, col, where } = require("sequelize");
const { groupAppointments, now, overlap, okayToAssign } = require("../../utils/helper");
const moment = require('moment-timezone');
const { DateTime } = require('luxon');


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
 * Fetches all appointments for a specific date, grouped by technician.
 * 
 * This route retrieves appointments for the specified date from the database,
 * ensuring that only non-deleted appointments are included. The appointments
 * are then grouped by technician, and the response contains the grouped data,
 * including technician names, associated appointments, services, and customer details.
 * 
 * @route GET /calender
 * @param {Object} req - The Express request object.
 * @param {Object} req.query - The query parameters of the request.
 * @param {string} req.query.date - The date for which appointments are fetched (format: YYYY-MM-DD).
 * @param {Object} res - The Express response object.
 * @returns {Object} JSON response containing grouped appointments by technician.
 * @returns {Object[]} res.body - Array of technician data with associated appointments.
 * @returns {number} res.body[].id - Technician ID.
 * @returns {string} res.body[].name - Technician name.
 * @returns {Object[]} res.body[].appointments - List of appointments for the technician.
 * @returns {number} res.body[].appointments[].id - Appointment ID.
 * @returns {string} res.body[].appointments[].date - Appointment date.
 * @returns {Object[]} res.body[].appointments[].services - List of services in the appointment.
 * @returns {number} res.body[].appointments[].services[].id - Service ID.
 * @returns {string} res.body[].appointments[].services[].name - Service name.
 * @returns {number} res.body[].appointments[].services[].time - Service duration in minutes.
 * @returns {Object|null} res.body[].appointments[].customer - Customer details (null if no customer).
 * @returns {number} res.body[].appointments[].customer.id - Customer ID.
 * @returns {string} res.body[].appointments[].customer.name - Customer name.
 * @throws {400} If the `date` parameter is missing.
 * @throws {500} If there is an error fetching appointments from the database.
 * 
 * @example
 * // Example of calling the `/calender` route with a date parameter
 * fetch('/calender?date=2025-02-20')
 *   .then(response => response.json())
 *   .then(data => {
 *     console.log(data); // Process the grouped appointment data
 *   })
 *   .catch(error => {
 *     console.error(error); // Handle any errors that occur during the request
 *   });
 */
router.get("/calender", async (req, res) => {
  try {
    // Extract the date from query parameters
    const { date } = req.query;
    // Validate the date
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required." });
    }
    // Fetch appointments for the specified date
    const appointments = await Appointment.findAll({
      where: {
        date: date,
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
          attributes: ["id", "name", "time"], // Include service details
          through: { attributes: [] }, // Exclude join table details
        },
        {
          model: Customer,
          attributes: ["id", "name"], // Include customer information
        }
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

    // Parse start service time using Luxon
    const startServiceTime = DateTime.fromISO(`${date}T${start_service_time}`, { zone: "America/Los_Angeles" });
    if (!startServiceTime.isValid) {
      return res.status(400).json({ message: "Invalid date or start service time format." });
    }

    // Fetch service durations
    const services = await Service.findAll({
      where: { id: service_ids },
      attributes: ["id", "time"],
    });

    if (!services || services.length !== service_ids.length) {
      return res.status(400).json({ message: "Some services are invalid or not found." });
    }

    // Calculate total service time
    const totalServiceMinutes = services.reduce((sum, service) => sum + service.time, 0);

    const endServiceTime = startServiceTime.plus({ minutes: totalServiceMinutes });

    // Fetch all existing appointments for the technician on the same date
    const existingAppointments = await Appointment.findAll({
      include: [
        {
          model: Technician,
          where: { id: technician_id },
        },
        {
          model: Service,
          attributes: ["time"],
          through: { attributes: [] },
        },
      ],
      where: {
        date,
        [Op.or]: [
          { note: null },
          { note: { [Op.not]: "deleted" } },
        ],
      },
    });

    // Check for overlaps
    const hasOverlap = overlap(existingAppointments, startServiceTime, endServiceTime);

    if (hasOverlap) {
      return res.status(400).json({
        message: "Appointment overlaps with an existing appointment.",
        conflictingSlot: start_service_time,
      });
    }

    // Create the appointment
    const newAppointment = await Appointment.create({
      customer_id,
      date,
      start_service_time,
    });

    // Associate technicians
    if (technician_id) {
      await newAppointment.addTechnicians(Array.isArray(technician_id) ? technician_id : [technician_id]);
    }

    // Associate services
    if (service_ids && service_ids.length > 0) {
      await newAppointment.addServices(service_ids);
    }

    return res.status(201).json(newAppointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @route GET /search
 * @description This endpoint searches for appointments based on the provided keyword.
 * The search will filter appointments where:
 * - Customer name, phone, or email contains the keyword.
 * - Technician name or service name contains the keyword.
 * The appointment must also have a date and start service time greater than or equal to the current time in Seattle.
 * 
 * @query {string} keyword - The search keyword (can match customer name, phone, email, technician name, or service name).
 * 
 * @returns {Object[]} appointments - A list of appointments that match the search criteria.
 * 
 * @throws {500} - If there is an internal server error during the search operation.
 */
router.get("/search", async (req, res) => {
  try {
    const { keyword } = req.query;

    const searchCondition = keyword && keyword !== '*' && keyword !== '**'
      ? {
        [Op.or]: [
          where(fn('LOWER', col('Customer.name')), {
            [Op.like]: `%${keyword.toLowerCase()}%`,
          }),
          where(fn('LOWER', col('Customer.phone')), {
            [Op.like]: `%${keyword.toLowerCase()}%`,
          }),
          where(fn('LOWER', col('Customer.email')), {
            [Op.like]: `%${keyword.toLowerCase()}%`,
          }),
          where(fn('LOWER', col('Technicians.name')), {
            [Op.like]: `%${keyword.toLowerCase()}%`,
          }),
          where(fn('LOWER', col('Services.name')), {
            [Op.like]: `%${keyword.toLowerCase()}%`,
          }),
        ],
      }
      : {};

    const seattleNow = moment().tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss");

    // Determine if we should apply the future-only date filter
    const includeFutureOnly = keyword !== '**';

    const whereConditions = [
      {
        [Op.or]: [
          { note: null },
          { note: { [Op.not]: "deleted" } },
        ],
      },
      searchCondition
    ];

    if (includeFutureOnly) {
      whereConditions.push(
        where(
          fn('CONCAT', col('date'), ' ', col('start_service_time')),
          { [Op.gte]: seattleNow }
        )
      );
    }

    const appointments = await Appointment.findAll({
      where: {
        [Op.and]: whereConditions,
      },
      include: [
        {
          model: Technician,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          model: Service,
          attributes: ["id", "name", "time", "price"],
          through: { attributes: [] },
        },
        {
          model: Customer,
          attributes: ["id", "name", "phone", "email"],
        }
      ],
      order: [["date", "DESC"], ["start_service_time", "ASC"]],
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to search appointments." });
  }
});

/**
 * @route GET /find_alternative_techs
 * @group Appointments - Endpoints related to appointments and technicians
 * @summary Find available technicians for a given appointment time
 * @param {string} id.query.required - ID of the appointment to check alternatives for
 * @returns {Array.<Technician>} 200 - An array of available technician objects
 * @returns {object} 400 - Invalid input (e.g. missing or malformed time/date, services not found)
 * @returns {object} 404 - Appointment not found
 * @returns {object} 500 - Server error
 * 
 * @example Request:
 * GET /find_alternative_techs?id=123
 * 
 * @example Successful Response (200):
 * [
 *   {
 *     "id": 1,
 *     "name": "Jane Doe",
 *     "description": "Senior technician with 5 years experience"
 *     "unavailability": "0"
 *   },
 *   {
 *     "id": 2,
 *     "name": "John Smith",
 *     "description": "Specialist in HVAC systems"
 *     "unavailability": "1,3"
 *   }
 * ]
 * 
 * @description 
 * This endpoint accepts an appointment ID, calculates the required service duration, 
 * and then checks for available technicians who are not already scheduled for conflicting appointments.
 * It returns a list of technicians who are free during that time window and not marked as deleted.
 */
router.get("/find_alternative_techs", async (req, res) => {
  try {
    const technicians = [];
    const { id } = req.query;

    const appointment = await Appointment.findOne({
      where: {
        id,
        [Op.or]: [
          { note: null },
          { note: { [Op.not]: "deleted" } },
        ],
      },
      include: [
        {
          model: Technician,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
        {
          model: Service,
          attributes: ["id", "name", "time", "price"],
          through: { attributes: [] },
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const listed_technicians = await Technician.findAll({
      attributes: ["id", "name", "description", "unavailability"]
    });

    for (const tech of listed_technicians) {
      if (await okayToAssign(tech, appointment)) {
        technicians.push(tech);
      }
    }

    res.status(200).json(technicians);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

/**
 * @route PUT /update_technician
 * @description Updates the technician assigned to a given appointment.
 *
 * This route:
 * 1. Validates request body to ensure `id` and `technician_id` are provided.
 * 2. Retrieves the appointment and the technician from the database.
 * 3. Checks if the technician is available for the appointment time using `okayToAssign`.
 * 4. If available, updates the technician assignment.
 * 5. If not available, returns a 409 Conflict response.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {number|string} req.body.id - The ID of the appointment to update.
 * @param {number|string} req.body.technician_id - The ID of the technician to assign.
 * 
 * @param {Object} res - Express response object
 * 
 * @returns {Object} JSON response:
 * - 200 OK with success message and updated technician if update is successful.
 * - 400 Bad Request if required fields are missing.
 * - 404 Not Found if the appointment or technician is not found.
 * - 409 Conflict if the technician is unavailable at the requested time.
 * - 500 Server Error for unexpected issues.
 * 
 * @example
 * PUT /update_technician
 * Request Body:
 * {
 *   "id": 42,
 *   "technician_id": 7
 * }
 * 
 * Response (200):
 * {
 *   "message": "Technician updated successfully.",
 *   "updatedTechnician": { ...technician object... }
 * }
 */
router.put("/update_technician", async (req, res) => {
  try {
    const { id, technician_id } = req.body;

    if (!id || !technician_id) {
      return res.status(400).json({ message: "Missing appointment ID or technician ID." });
    }

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Service,
          attributes: ["id", "name", "time", "price"],
          through: { attributes: [] },
        }
      ]
    });
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const technician = await Technician.findByPk(technician_id);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found." });
    }

    if (await okayToAssign(technician, appointment)) {
      await appointment.setTechnicians([technician]);
    } else {
      return res.status(409).json({
        message: "Technician is not available at the selected appointment time.",
        technician_id,
        appointment_id: id,
      });
    }

    res.status(200).json({
      message: "Technician updated successfully.",
      updatedTechnician: technician,
    });
  } catch (error) {
    console.error("Error updating technician:", error);
    res.status(500).json({ message: "Server error." });
  }
});





module.exports = router;
