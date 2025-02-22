const express = require("express");
const router = express.Router();

const serviceRoutes = require("./ServiceRoute");
const technicianRoutes = require("./TechnicianRoute");
const customerRoutes = require("./CustomerRoute");
const appointmentRoutes = require("./AppointmentRoute");
const categoryRoutes = require("./CategoryRoute");
const miscellaneousesRoutes = require("./MiscellaneousRoute");
const authenticationRoutes = require("./AuthenticationRoute");
const notificationRoutes = require("./NotificationRoute");

// Use the routes for each model
router.use("/services", serviceRoutes);
router.use("/technicians", technicianRoutes);
router.use("/customers", customerRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/categories", categoryRoutes);
router.use("/miscellaneouses", miscellaneousesRoutes);
router.use("/authentication", authenticationRoutes);
router.use("/notification", notificationRoutes);

module.exports = router;
