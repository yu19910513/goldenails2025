const express = require("express");
const router = express.Router();

const serviceRoutes = require("./ServiceRoute");
const technicianRoutes = require("./TechnicianRoute");
const customerRoutes = require("./CustomerRoute");
const appointmentRoutes = require("./AppointmentRoute");
const categoryRoutes = require("./CategoryRoute");
const miscellaneousesRoutes = require("./MiscellaneousRoute");
const paymentsRoutes = require('./PaymentsRoute');

// Use the routes for each model
router.use("/services", serviceRoutes);
router.use("/technicians", technicianRoutes);
router.use("/customers", customerRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/miscellaneouses", miscellaneousesRoutes);
router.use("/payments", paymentsRoutes);

module.exports = router;
