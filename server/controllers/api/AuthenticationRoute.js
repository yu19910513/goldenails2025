/**
 * Express router for handling customer authentication via passcode.
 * @module routes/authentication
 */

const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Customer } = require("../../models");
const { sendEmail, sendSMS } = require("../../utils/notification");
const { validateContactType } = require("../../utils/helper");
const { signToken, getTokenExpiration } = require("../../utils/authentication");

/**
 * Route to send a passcode to the customer via email or SMS.
 * @route POST /send-passcode
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.identifier - Customer's email or phone number
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success or error message
 */
router.post("/send-passcode", async (req, res) => {
    try {
        const { identifier } = req.body;

        if (!identifier) return res.status(400).json({ message: "Identifier required" });

        const customer = await Customer.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { phone: identifier }
                ]
            }
        });

        if (!customer) return res.status(404).json({ message: "Customer not found" });

        const passcode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
        customer.passcode = passcode;
        await customer.save();

        const identifierType = validateContactType(identifier);
        if (identifierType === "email") {
            sendEmail({ address: customer.email, subject: "Your Login Code", text: `Your passcode is: ${passcode}` });
        } else if (identifierType === "phone") {
            sendSMS(customer.phone, `Your passcode is: ${passcode}`);
        }

        res.status(200).json({ message: "Passcode sent" });
    } catch (error) {
        console.error("Error in /send-passcode:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * @route   POST /verify-passcode
 * @desc    Verifies a customer's passcode and issues a JSON Web Token.
 * @access  Public
 *
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {string} req.body.identifier - The customer's email or phone number.
 * @param {string} req.body.passcode - The one-time passcode.
 * @param {object} res - Express response object.
 *
 * @returns {Promise<void>} Sends a JSON response with a token on success,
 * or an error message on failure.
 */
router.post("/verify-passcode", async (req, res) => {
    try {
        const { identifier, passcode } = req.body;

        const customer = await Customer.findOne({
            where: {
                [Op.or]: [{ email: identifier }, { phone: identifier }],
            },
        });

        if (!customer || customer.passcode !== passcode) {
            return res.status(400).json({ message: "Invalid passcode" });
        }

        customer.passcode = null;
        await customer.save();

        const tokenExpiration = getTokenExpiration(customer.admin_privilege);

        const payload = {
            phone: customer.phone,
            id: customer.id,
            name: customer.name,
            admin_privilege: customer.admin_privilege,
        };

        const token = signToken(payload, tokenExpiration);

        res.status(200).json({ token });
    } catch (error) {
        console.error("Error in /verify-passcode:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
