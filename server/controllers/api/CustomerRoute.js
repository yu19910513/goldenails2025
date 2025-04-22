const express = require("express");
const router = express.Router();
const { Customer } = require("../../models");
const { Op, fn, col, where } = require('sequelize');

/**
 * @route GET /search
 * @description Searches for a customer by phone number.
 * @param {Object} req - The request object.
 * @param {Object} req.query - The query parameters of the request.
 * @param {string} req.query.phone - The phone number of the customer to search for.
 * @param {Object} res - The response object.
 * @returns {Object} 200 - The customer object if the customer is found.
 * @returns {Object} 400 - Error message if the phone number is missing.
 * @returns {Object} 404 - Message if the customer is not found.
 * @returns {Object} 500 - Error message if an error occurs during the search.
 * @throws {Error} If an error occurs while querying the customer.
 */
router.get("/search", async (req, res) => {
  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  try {
    const customer = await Customer.findOne({ where: { phone } });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error searching customer:", error);
    res.status(500).json({ error: "An error occurred while searching for the customer." });
  }
});

/**
 * @route GET /smart_search
 * @desc Search for customers by keyword or return all customers if keyword is '*'.
 *       Returns an empty array if no keyword is provided.
 * @queryParam {string} keyword - The search keyword. Matches against name, phone, or email.
 *                                If '*' is provided, returns all customers.
 * @returns {Object[]} 200 - Array of matched customer objects
 * @returns {string}   200[].id - Customer ID
 * @returns {string}   200[].name - Customer name
 * @returns {string}   200[].phone - Customer phone
 * @returns {string}   200[].email - Customer email
 * @returns {Object}   500 - Error object with message on failure
 */
router.get('/smart_search', async (req, res) => {
  try {
    const keyword = (req.query.keyword || '').trim().toLowerCase();

    let whereCondition = {};

    if (keyword && keyword !== '*') {
      whereCondition = {
        [Op.or]: [
          where(fn('LOWER', col('Customer.name')), {
            [Op.like]: `%${keyword}%`
          }),
          where(fn('LOWER', col('Customer.phone')), {
            [Op.like]: `%${keyword}%`
          }),
          where(fn('LOWER', col('Customer.email')), {
            [Op.like]: `%${keyword}%`
          }),
        ],
      };
    } else if (!keyword) {
      return res.status(200).json([]); // No keyword → return empty array
    }

    const customers = await Customer.findAll({
      where: whereCondition,
      attributes: ['id', 'name', 'phone', 'email'],
      order: [['name', 'ASC']],
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error('Customer search error:', error);
    res.status(500).json({ error: 'Failed to search customers.' });
  }
});

/**
 * @route GET /validate
 * @description Validates a customer by their phone number and name.
 * @queryParam {string} phone - The phone number of the customer.
 * @queryParam {string} name - The name of the customer.
 * @returns {Object} The customer data if validation is successful.
 * @throws {400} If phone or name is missing.
 * @throws {404} If no customer is found with the provided phone and name.
 * @throws {500} If an error occurs during the database query.
 */
router.get("/validate", async (req, res) => {
  const { phone, name } = req.query;

  // Validate input
  if (!phone || !name || phone.trim() === "" || name.trim() === "") {
    return res.status(400).json({ error: "Either phone or name is missing or invalid." });
  }

  try {
    const customer = await Customer.findOne({
      where: { phone: phone.trim(), name: name.trim() },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    res.json(customer);
  } catch (error) {
    console.error("Error searching for customer:", error);
    res.status(500).json({ error: "An error occurred while searching for the customer." });
  }
});


/**
 * @route POST /
 * @description Creates a new customer if the phone number does not already exist.
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.name - The name of the customer (required).
 * @param {string} req.body.phone - The phone number of the customer (required).
 * @param {string} [req.body.email] - The email of the customer (optional).
 * @param {Object} res - The response object.
 * @returns {Object} 201 - Returns the newly created customer if successful.
 * @returns {Object} 400 - Returns an error if name or phone number is missing.
 * @returns {Object} 409 - Returns an error if a customer with the phone number already exists.
 * @returns {Object} 500 - Returns an error if an internal server error occurs.
 */
router.post("/", async (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone number are required." });
  }

  try {
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ where: { phone } });

    if (existingCustomer) {
      // Reject the request if the customer already exists
      return res.status(409).json({ error: "Customer with this phone number already exists." });
    }

    // If the customer does not exist, create a new customer
    const newCustomer = await Customer.create({ name, phone, email });

    res.status(201).json(newCustomer); // Return the newly created customer
  } catch (error) {
    console.error("Error processing customer:", error);
    res.status(500).json({ error: "An error occurred while processing the customer." });
  }
});


/**
 * Updates an existing customer in the database.
 *
 * @route PUT /customers/
 * @param {Object} req - The request object.
 * @param {Object} req.body - The customer data to update.
 * @param {number} req.body.id - The unique identifier of the customer.
 * @param {string} [req.body.name] - The updated name of the customer.
 * @param {string} [req.body.phone] - The updated phone number of the customer.
 * @param {string} [req.body.email] - The updated email address of the customer.
 * @param {boolean} [req.body.optInSms] - Indicates if the customer opts into SMS notifications.
 * @param {Object} res - The response object.
 * @returns {Object} 200 - Updated customer data.
 * @returns {Object} 400 - Bad request if the ID is missing.
 * @returns {Object} 500 - Internal server error.
 */
router.put("/", async (req, res) => {
  try {
    const { id, name, phone, email, optInSms } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Customer ID is required." });
    }

    // Find the customer by ID
    const customer = await Customer.findByPk(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    // Update the customer record
    await customer.update({ name, phone, email, optInSms });

    return res.status(200).json({ message: "Customer updated successfully.", customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});



module.exports = router;
