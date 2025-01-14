const express = require("express");
const router = express.Router();
const { Appointment } = require("../../models");

// GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve appointments" });
  }
});

// GET a single appointment by ID
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve the appointment" });
  }
});

// POST a new appointment
router.post("/", async (req, res) => {
  try {
    const { customerId, date, startServiceTime } = req.body;
    if (!customerId || !date || !startServiceTime)
      return res.status(400).json({ error: "Missing required fields" });
    const newAppointment = await Appointment.create({ customerId, date, startServiceTime });
    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// PUT to update an appointment by ID
router.put("/:id", async (req, res) => {
  try {
    const { customerId, date, startServiceTime } = req.body;
    const updatedAppointment = await Appointment.update(
      { customerId, date, startServiceTime },
      { where: { id: req.params.id } }
    );
    if (!updatedAppointment[0]) return res.status(404).json({ error: "Appointment not found" });
    res.status(200).json({ message: "Appointment updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// DELETE an appointment by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedAppointment = await Appointment.destroy({ where: { id: req.params.id } });
    if (!deletedAppointment) return res.status(404).json({ error: "Appointment not found" });
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

module.exports = router;
