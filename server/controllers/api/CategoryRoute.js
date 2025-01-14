const express = require("express");
const router = express.Router();
const { Category, Service } = require("../../models");

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Service }], // Include services in the response if needed
    });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve categories" });
  }
});

// GET a single category by ID
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{ model: Service }], // Include services in the response if needed
    });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve the category" });
  }
});

// POST a new category
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const newCategory = await Category.create({ name });
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: "Failed to create a new category" });
  }
});

// PUT to update a category by ID
router.put("/:id", async (req, res) => {
  try {
    const { name } = req.body;

    const updatedCategory = await Category.update(
      { name },
      { where: { id: req.params.id } }
    );

    if (!updatedCategory[0]) {
      return res.status(404).json({ error: "Category not found or no changes made" });
    }

    res.status(200).json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update the category" });
  }
});

// DELETE a category by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.destroy({ where: { id: req.params.id } });

    if (!deletedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete the category" });
  }
});

module.exports = router;
