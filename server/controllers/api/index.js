const express = require("express");
const router = express.Router();

const serviceRoutes = require("./ServiceRoute");
const technicianRoutes = require("./TechnicianRoute");
const customerRoutes = require("./CustomerRoute");
const appointmentRoutes = require("./AppointmentRoute");
const categoryRoutes = require("./CategoryRoute");

// Use the routes for each model
router.use("/services", serviceRoutes);
router.use("/technicians", technicianRoutes);
router.use("/customers", customerRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/categories", categoryRoutes);

module.exports = router;
