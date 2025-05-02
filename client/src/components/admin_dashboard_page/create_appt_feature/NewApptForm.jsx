import React, { useState, useEffect, useRef } from "react";
import CustomerService from "../../../services/customerService"; // must include smart_search

const technicians = ["Alice", "Bob", "Charlie"];

const NewApptForm = ({ selectedServices }) => {
  const selectionMade = useRef(false);
  const [form, setForm] = useState({
    phone: "",
    name: "",
    email: "",
    date: "",
    time: "",
    technician: "",
    sendSMS: false,
    sendEmail: false,
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = form.phone.trim();
      if (trimmed.length < 3) {
        if (trimmed !== '*') {
          setSuggestions([]);
          return;
        }
      }
      if (selectionMade.current) {
        selectionMade.current = false;
        return;
      }
      try {
        const res = await CustomerService.smart_search(trimmed);
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error fetching customer suggestions:", err);
      }
    };

    fetchSuggestions();
  }, [form.phone]);

  const handleSelectSuggestion = (customer) => {
    selectionMade.current = true;
    setForm({
      ...form,
      phone: customer.phone || "",
      name: customer.name || "",
      email: customer.email || "",
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handlePhoneChange = (e) => {
    setForm({ ...form, phone: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fullForm = {
      ...form,
      services: selectedServices,
    };

    console.log("Submitted form:", fullForm);
    // Submit logic here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto p-6 shadow-lg rounded-xl bg-white relative">
      <h2 className="text-2xl font-bold mb-4">New Appointment</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        <div className="relative">
          <input
            type="tel"
            placeholder="Smart Search/ Phone Number"
            value={form.phone}
            onChange={handlePhoneChange}
            required
            className="border rounded p-2 w-full"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded shadow-md mt-1 z-50 max-h-48 overflow-y-auto">
              {suggestions.map((cust) => (
                <li
                  key={cust.id}
                  onClick={() => handleSelectSuggestion(cust)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{cust.name}</div>
                  <div className="text-sm text-gray-600">{cust.phone}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border rounded p-2 w-full"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <select
          value={form.technician}
          onChange={(e) => setForm({ ...form, technician: e.target.value })}
          required
          className="border rounded p-2 w-full"
        >
          <option value="">Select Technician</option>
          {technicians.map((tech, i) => (
            <option key={i} value={tech}>{tech}</option>
          ))}
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="border rounded p-2 w-full"
        />
        <input
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
          className="border rounded p-2 w-full"
        />
      </div>

      {/* List selected services */}
      <div>
        <label className="font-semibold block mb-2">Selected Services</label>
        <ul className="list-disc pl-5 text-gray-700">
          {selectedServices.length === 0 ? (
            <li>No services selected.</li>
          ) : (
            selectedServices.map((svc, idx) => (
              <li key={idx}>{svc.name}</li>
            ))
          )}
        </ul>
      </div>

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.sendSMS}
            onChange={(e) => setForm({ ...form, sendSMS: e.target.checked })}
          />
          Send SMS
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.sendEmail}
            onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
          />
          Send Email
        </label>
      </div>

      <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
        Submit
      </button>
    </form>
  );
};

export default NewApptForm;
