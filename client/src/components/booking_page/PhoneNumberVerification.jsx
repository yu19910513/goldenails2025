import React, { useState } from "react";
import { Link } from 'react-router-dom'
import CustomerService from "../../services/customerService";

const PhoneNumberVerification = ({ onVerify }) => {
  const [phone, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [optInSms, setOptInSms] = useState(true);  // State to track SMS opt-in
  localStorage.setItem("smsOptIn", optInSms);
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

    let newCustomer = { phone, name: name.trim().toUpperCase(), email: email || null, optInSms };

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100" style={{ backgroundColor: "transparent" }}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome to the Booking Page</h2>
        <p className="text-gray-700 mb-6 text-center">
          Enter your phone number to get started! Returning customers will be directed to the service menu after verification. If you're new, we’ll need your name and, optionally, your email if you’d like to stay updated with newsletters featuring promotions and discounts. Your phone number and name will also provide access to your appointment history on our website. Have questions? Reach out to us at (253) 851-7563—we’re here to help!
        </p>

        {/* Error message */}
        {errorMessage && (
          <div className="text-red-500 text-center mb-4">{errorMessage}</div>
        )}
        {/* Opt-in SMS Checkbox */}
        <div className="mb-5 flex items-center">
          <input
            type="checkbox"
            id="smsOptIn"
            checked={optInSms}
            onChange={(e) => {
              setOptInSms(e.target.checked);
              localStorage.setItem("smsOptIn", e.target.checked);
            }}
            className="h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
          />
          {!optInSms ? (
            <small className="ml-4 text-xs text-red-600 relative">
              You opted out of text messages for appointment confirmation.
            </small>
          ) : (
            <small htmlFor="smsOptIn" className="ml-4 text-xs text-gray-600 relative">
              By opting in, you agree to receive text message for appointment reminders, confirmations, and updates. You can opt-out at any time by contacting us directly. You may also refer to our
              <Link to="/privacy-policy">Privacy Policy</Link>
            </small>)}
        </div>
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
        {!isNewCustomer && (<button
          onClick={handleVerify}
          className="w-full py-2 bg-yellow-500 text-white font-semibold rounded-lg border-2 border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 transition"
        >
          Verify
        </button>)}

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
