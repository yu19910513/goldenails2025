/**
 * Express router for handling customer authentication via passcode.
 * @module routes/authentication
 */

const express = require("express");
const router = express.Router();
const { Customer } = require("../../models");
const { sendEmail, sendSMS } = require("../../utils/notification");
const { validateContactType } = require("../../utils/helper");
const { signToken } = require("../../utils/authentication");

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
            $or: [{ email: identifier }, { phone: identifier }],
        });

        if (!customer) return res.status(404).json({ message: "Customer not found" });

        const passcode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code
        customer.passcode = passcode;
        await customer.save();

        const identifierType = validateContactType(identifier);
        if (identifierType === "email") {
            await sendEmail({ address: customer.email, subject: "Your Login Code", text: `Your passcode is: ${passcode}` });
        } else if (identifierType === "phone") {
            await sendSMS(customer.phone, `Your passcode is: ${passcode}`);
        }

        res.status(200).json({ message: "Passcode sent" });
    } catch (error) {
        console.error("Error in /send-passcode:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Route to verify the passcode entered by the customer and return an authentication token.
 * @route POST /verify-passcode
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.identifier - Customer's email or phone number
 * @param {string} req.body.passcode - Passcode received by the customer
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with authentication token or error message
 */
router.post("/verify-passcode", async (req, res) => {
    try {
        const { identifier, passcode } = req.body;

        const customer = await Customer.findOne({
            $or: [{ email: identifier }, { phone: identifier }],
        });

        if (!customer || customer.passcode !== passcode) {
            return res.status(400).json({ message: "Invalid passcode" });
        }

        customer.passcode = null;
        await customer.save();

        const token = signToken({ phone: customer.phone, id: customer.id, name: customer.name, admin_privilege: customer.admin_privilege });

        res.status(200).json({ token });
    } catch (error) {
        console.error("Error in /verify-passcode:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
