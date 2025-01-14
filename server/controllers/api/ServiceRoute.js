const express = require("express");
const router = express.Router();
const { Service, Category } = require("../../models");

router.get("/", async (req, res) => {
  try {
    console.log("Got a request!!");

    // Fetch services along with their associated categories
    const serviceRawData = await Service.findAll({
      attributes: ["id", "name", "price"], // Service attributes
      include: [
        {
          model: Category, // Include Category model
          attributes: ["id", "name"], // Category attributes
        },
      ],
    });

    // Serialize the data
    const servicesData = serviceRawData.map((service) =>
      service.get({ plain: true })
    );

    // Group services by categories
    const categorizedServices = servicesData.reduce((acc, service) => {
      const category = service.Category;

      // Check if the category already exists in the accumulator
      const existingCategory = acc.find((cat) => cat.id === category.id);
      if (existingCategory) {
        existingCategory.services.push({
          id: service.id,
          name: service.name,
          price: service.price,
        });
      } else {
        // Add new category
        acc.push({
          id: category.id,
          name: category.name,
          services: [
            {
              id: service.id,
              name: service.name,
              price: service.price,
            },
          ],
        });
      }

      return acc;
    }, []);

    res.status(200).json(categorizedServices);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// GET a single service by ID
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve the service" });
  }
});

// POST a new service
router.post("/", async (req, res) => {
  try {
    const { name, price, time, categoryId } = req.body;

    if (!name || !price || !time || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newService = await Service.create({ name, price, time, categoryId });
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ error: "Failed to create a new service" });
  }
});

// PUT to update a service by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, price, time, categoryId } = req.body;

    const updatedService = await Service.update(
      { name, price, time, categoryId },
      { where: { id: req.params.id } }
    );

    if (!updatedService[0]) {
      return res.status(404).json({ error: "Service not found or no changes made" });
    }

    res.status(200).json({ message: "Service updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update the service" });
  }
});

// DELETE a service by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedService = await Service.destroy({ where: { id: req.params.id } });

    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete the service" });
  }
});

module.exports = router;
