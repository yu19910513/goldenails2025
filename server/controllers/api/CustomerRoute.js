const express = require("express");
const router = express.Router();
const { Customer } = require("../../models");

// GET all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.status(200).json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve customers" });
  }
});

// GET a single customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve the customer" });
  }
});

// POST a new customer
router.post("/", async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone are required" });
    const newCustomer = await Customer.create({ name, phone, email });
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// PUT to update a customer by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const updatedCustomer = await Customer.update({ name, phone, email }, { where: { id: req.params.id } });
    if (!updatedCustomer[0]) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json({ message: "Customer updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// DELETE a customer by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCustomer = await Customer.destroy({ where: { id: req.params.id } });
    if (!deletedCustomer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
