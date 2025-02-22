const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const { sendEmail, sendSMS } = require("../utils/notification");
const jwt = require("jsonwebtoken");

router.post("/send-passcode", async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: "Identifier required" });

    const customer = await Customer.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const passcode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    customer.passcode = passcode;
    await customer.save();

    if (customer.email) {
        await sendEmail(customer.email, "Your Login Code", `Your passcode is: ${passcode}`);
    } else if (customer.phone) {
        await sendSMS(customer.phone, `Your passcode is: ${passcode}`);
    }

    res.json({ message: "Passcode sent" });
});

router.post("/verify-passcode", async (req, res) => {
    const { identifier, passcode } = req.body;

    const customer = await Customer.findOne({
        $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!customer || customer.passcode !== passcode) {
        return res.status(400).json({ message: "Invalid passcode" });
    }

    customer.passcode = null;
    await customer.save();

    const token = jwt.sign({ id: customer._id }, "your-secret-key", { expiresIn: "1h" });

    res.json({ token });
});

module.exports = router;
