/**
 * Express router for handling API routes related to various models.
 * @module routes/index
 */

const express = require("express");
const router = express.Router();
const { level_3_auth } = require("../../utils/authentication");

const serviceRoutes = require("./ServiceRoute");
const technicianRoutes = require("./TechnicianRoute");
const customerRoutes = require("./CustomerRoute");
const appointmentRoutes = require("./AppointmentRoute");
const categoryRoutes = require("./CategoryRoute");
const miscellaneousesRoutes = require("./MiscellaneousRoute");
const authenticationRoutes = require("./AuthenticationRoute");
const notificationRoutes = require("./NotificationRoute");

/**
 * Use the routes for each model.
 * @name API Routes
 */
router.use("/services", level_3_auth, serviceRoutes);
router.use("/technicians", level_3_auth, technicianRoutes);
router.use("/customers", level_3_auth, customerRoutes);
router.use("/appointments", level_3_auth, appointmentRoutes);
router.use("/categories", level_3_auth, categoryRoutes);
router.use("/miscellaneouses", level_3_auth, miscellaneousesRoutes);
router.use("/authentication", level_3_auth, authenticationRoutes);
router.use("/notification", level_3_auth, notificationRoutes);

module.exports = router;
