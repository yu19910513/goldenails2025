/**
 * Express router for handling API routes related to various models.
 * @module routes/index
 */

const express = require("express");
const router = express.Router();

const serviceRoutes = require("./ServiceRoute");
const technicianRoutes = require("./TechnicianRoute");
const customerRoutes = require("./CustomerRoute");
const appointmentRoutes = require("./AppointmentRoute");
const categoryRoutes = require("./CategoryRoute");
const miscellaneousesRoutes = require("./MiscellaneousRoute");//deprecated
const localDbRoutes = require('./LocalDbRoute');
const authenticationRoutes = require("./AuthenticationRoute");
const notificationRoutes = require("./NotificationRoute");

/**
 * Use the routes for each model.
 * @name API Routes
 */
router.use("/services", serviceRoutes);
router.use("/technicians", technicianRoutes);
router.use("/customers", customerRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/miscellaneouses", miscellaneousesRoutes);
router.use("/local_db", localDbRoutes);
router.use("/authentication", authenticationRoutes);
router.use("/notification", notificationRoutes);

module.exports = router;
