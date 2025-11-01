const express = require("express");
const router = express.Router();
const { Service, Category } = require("../../models");

/**
 * GET /services
 *
 * Retrieves all non-deprecated services from the database, grouped by their categories.
 * Each service includes its description, name, price, and time. Services marked as
 * deprecated will be excluded from the response.
 *
 * Response format example:
 * [
 *   {
 *     id: 1,
 *     name: "Nails",
 *     services: [
 *       {
 *         id: 101,
 *         name: "Manicure",
 *         description: "Basic nail cleaning and shaping",
 *         price: 25,
 *         time: 30,
 *         category_id: 1
 *       },
 *       ...
 *     ]
 *   },
 *   {
 *     id: 2,
 *     name: "Facials",
 *     services: [
 *       {
 *         id: 201,
 *         name: "Deep Cleansing Facial",
 *         description: "Cleanses pores and rejuvenates skin",
 *         price: 60,
 *         time: 60,
 *         category_id: 2
 *       },
 *       ...
 *     ]
 *   }
 * ]
 *
 * @route GET /services
 * @returns {Array<Object>} 200 - A list of categories with their non-deprecated services
 * @returns {Object} 500 - Internal server error response
 *
 * @example
 * // Success response
 * res.status(200).json([
 *   {
 *     id: 1,
 *     name: "Nails",
 *     services: [{ id: 101, name: "Manicure", description: "Basic nail cleaning", price: 25, time: 30, category_id: 1 }]
 *   }
 * ]);
 *
 * @example
 * // Error response
 * res.status(500).json({ message: "Internal server error" });
 */
router.get("/", async (req, res) => {
  try {
    const serviceRawData = await Service.findAll({
      attributes: ["id", "name", "description", "price", "time"],
      where: { deprecated: 0 },
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      order: [["category_id", "ASC"], ["id", "ASC"]],
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
      const serviceObj = {
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        time: service.time,
        category_id: category.id,
      };

      if (existingCategory) {
        existingCategory.services.push(serviceObj);
      } else {
        // Add new category
        acc.push({
          id: category.id,
          name: category.name,
          services: [serviceObj],
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
