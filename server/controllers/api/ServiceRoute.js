const express = require("express");
const router = express.Router();
const { Service, Category } = require("../../models");

/**
 * @route GET /
 * @description Retrieves a list of all services, categorized by their associated categories.
 * @access Public
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} - A JSON response containing a list of categorized services.
 * 
 * @throws {500} - If there is an internal server error (e.g., database failure). Example: { message: "Internal server error" }
 * 
 * @example
 * // Request:
 * GET /
 * 
 * // Success Response:
 * [
 *   {
 *     "id": 1,
 *     "name": "Plumbing",
 *     "services": [
 *       {
 *         "id": 1,
 *         "name": "Pipe Repair",
 *         "price": 100,
 *         "time": 60
 *       },
 *       {
 *         "id": 2,
 *         "name": "Leak Detection",
 *         "price": 120,
 *         "time": 90
 *       }
 *     ]
 *   },
 *   {
 *     "id": 2,
 *     "name": "Electrical",
 *     "services": [
 *       {
 *         "id": 3,
 *         "name": "Wiring Installation",
 *         "price": 200,
 *         "time": 120
 *       }
 *     ]
 *   }
 * ]
 * 
 * // Error Response (500):
 * {
 *   "message": "Internal server error"
 * }
 */
router.get("/", async (req, res) => {
  try {
    // Fetch services along with their associated categories
    const serviceRawData = await Service.findAll({
      attributes: ["id", "name", "price", "time"], // Service attributes
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
          time: service.time
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
              time: service.time
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

module.exports = router;
