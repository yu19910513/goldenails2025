const express = require("express");
const router = express.Router();
const { Technician } = require("../../models");

// GET all technicians
router.get("/", async (req, res) => {
  try {
    const technicians = await Technician.findAll();
    res.status(200).json(technicians);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve technicians" });
  }
});

// GET a single technician by ID
router.get("/:id", async (req, res) => {
  try {
    const technician = await Technician.findByPk(req.params.id);
    if (!technician) return res.status(404).json({ error: "Technician not found" });
    res.status(200).json(technician);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve the technician" });
  }
});

// POST a new technician
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const newTechnician = await Technician.create({ name });
    res.status(201).json(newTechnician);
  } catch (err) {
    res.status(500).json({ error: "Failed to create technician" });
  }
});

// PUT to update a technician by ID
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const updatedTechnician = await Technician.update({ name }, { where: { id: req.params.id } });
    if (!updatedTechnician[0]) return res.status(404).json({ error: "Technician not found" });
    res.status(200).json({ message: "Technician updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update technician" });
  }
});

// DELETE a technician by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedTechnician = await Technician.destroy({ where: { id: req.params.id } });
    if (!deletedTechnician) return res.status(404).json({ error: "Technician not found" });
    res.status(200).json({ message: "Technician deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete technician" });
  }
});

module.exports = router;
