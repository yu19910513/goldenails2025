import React, { useState } from "react";
import { Link } from 'react-router-dom';
import CustomerService from "../../services/customerService";

// Helper functions for validations
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const PhoneNumberVerification = ({ onVerify }) => {
  const [phone, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [optInSms, setOptInSms] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [expanded, setExpanded] = useState(false);

  localStorage.setItem("smsOptIn", optInSms);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
  };

  const handleVerify = async () => {
    setErrorMessage("");
    if (!validatePhone(phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    try {
      const response = await CustomerService.getOneByPhoneNumber(phone);
      const customer = response.data;
      setCustomerData(customer);
      if (!customer.email) {
        setShowEmailModal(true);
      } else {
        onVerify(customer);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setIsNewCustomer(true);
      } else {
        setErrorMessage("Unable to verify phone number. Please try again.");
      }
    }
  };

  const handleCreateCustomer = async () => {
    setErrorMessage("");
    if (!name) {
      setErrorMessage("Name is required.");
      return;
    }
    if (!validatePhone(phone)) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }
    if (email && !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const newCustomer = { phone, name: name.trim().toUpperCase(), email: email || null, optInSms };
    try {
      const createdCustomer = await CustomerService.upsert(newCustomer);
      onVerify(createdCustomer.data);
    } catch (error) {
      setErrorMessage(error.response.data.error);
    }
  };

  const handleSaveEmail = async () => {
    if (email && !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    try {
      const updatedCustomer = { ...customerData, email };
      await CustomerService.upsert(updatedCustomer);
      setShowEmailModal(false);
      onVerify(updatedCustomer);
    } catch (error) {
      setErrorMessage("Failed to update email. Please try again.");
    }
  };

  const renderErrorMessage = () => {
    return errorMessage && (
      <div className="text-red-500 text-center mb-4">{errorMessage}</div>
    );
  };

  const renderOptInSms = () => (
    <div className="mb-5 flex items-center">
      <input
        type="checkbox"
        id="smsOptIn"
        checked={optInSms}
        onChange={(e) => setOptInSms(e.target.checked)}
        className="h-4 w-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
      />
      <small className={`ml-4 text-xs ${optInSms ? 'text-gray-600' : 'text-red-600'}`}>
        {optInSms
          ? "By opting in, you agree to receive text message for appointment reminders, confirmations, and updates. You can opt-out at any time by contacting us directly."
          : "You opted out of text messages for appointment confirmation."}
        <Link to="/privacy-policy">Privacy Policy</Link>
      </small>
    </div>
  );

  const renderPhoneNumberInput = () => (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Enter Phone Number"
        value={phone}
        onChange={handlePhoneChange}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
    </div>
  );

  const renderCustomerForm = () => (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-center mb-4">New Customer Information</h3>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>
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
  );

  const renderEmailModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Stay Informed with Email Updates</h3>
        <p className="text-gray-700 mb-4">
          Welcome back, {customerData.name}! <br />
          It looks like we don’t have your email on record. Would you like to update it?
          {expanded ? (
            <>
              <br />
              Your email will be used exclusively for appointment confirmations, reminders, cancellations, and special promotions. We respect your privacy and will not share your information for any other purposes.
              <a onClick={() => setExpanded(false)}><small>(show less)</small></a>
            </>
          ) : (
            <a onClick={() => setExpanded(true)}><small>(read more)</small></a>
          )}
        </p>
        {renderErrorMessage()}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowEmailModal(false);
              onVerify(customerData);
            }}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Skip
          </button>
          <button
            onClick={handleSaveEmail}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome to the Booking Page</h2>
        <p className="text-gray-700 mb-6 text-center">
          Enter your phone number to get started! Returning customers will be directed to the service menu after verification. If you're new, we’ll need your name and, optionally, your email if you’d like to stay updated with newsletters featuring promotions and discounts. Your phone number and name will also provide access to your appointment history on our website. Have questions? Reach out to us at (253) 851-7563—we’re here to help!
        </p>
        {renderErrorMessage()}
        {renderOptInSms()}
        {renderPhoneNumberInput()}
        {!isNewCustomer && (
          <button
            onClick={handleVerify}
            className="w-full py-2 bg-yellow-500 text-white font-semibold rounded-lg border-2 border-yellow-600 hover:bg-yellow-600 hover:border-yellow-700 transition"
          >
            Verify
          </button>
        )}
        {isNewCustomer && renderCustomerForm()}
      </div>
      {showEmailModal && renderEmailModal()}
    </div>
  );
};

export default PhoneNumberVerification;
