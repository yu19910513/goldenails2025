import React, { useState } from "react";
import CustomerService from "../../services/customerService";

const PhoneNumberVerification = ({ onVerify }) => {
  const [phone, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const phoneRegex = /^[0-9]{10}$/; // Validates 10 digits phone number

  // Handle phone number change
  const handlePhoneChange = (e) => {
    let value = e.target.value;

    // Remove non-numeric characters to ensure only digits remain
    value = value.replace(/\D/g, "");
    setPhoneNumber(value);
  };

  // Validate and format the email
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Handle verification of phone number
  const handleVerify = async () => {
    if (!phoneRegex.test(phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    try {
      const response = await CustomerService.getOneByPhoneNumber(phone);
      onVerify(response.data); // Pass customer data to the parent component
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setIsNewCustomer(true); // Customer not found, show new customer form
      } else {
        console.error("Error during verification:", error);
        setErrorMessage("Unable to verify phone number. Please try again.");
      }
    }
  };

  // Handle customer creation
  const handleCreateCustomer = async () => {
    if (!name) {
      setErrorMessage("Name is required.");
      return;
    }

    let newCustomer = { phone, name: name.trim().toUpperCase(), email: email || null };

    // Validate email format if provided
    if (email && !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      const createdCustomer = await CustomerService.createCustomer(newCustomer);
      onVerify(createdCustomer.data);
    } catch (error) {
      console.error("Error creating customer:", error);
      setErrorMessage("Error creating customer. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100" style={{backgroundColor: "transparent"}}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Phone Number Verification</h2>

        {/* Error message */}
        {errorMessage && (
          <div className="text-red-500 text-center mb-4">{errorMessage}</div>
        )}

        {/* Phone Number Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <button
          onClick={handleVerify}
          className="w-full py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition"
        >
          Verify
        </button>

        {/* New Customer Form */}
        {isNewCustomer && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-center mb-4">New Customer Information</h3>

            {/* Name Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <button
              onClick={handleCreateCustomer}
              className="w-full py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneNumberVerification;
