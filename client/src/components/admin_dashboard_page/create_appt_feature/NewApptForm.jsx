import React, { useState, useEffect, useRef } from "react";
import CustomerService from "../../../services/customerService";
import TechnicianService from "../../../services/technicianService";
import "./NewApptForm.css";

const NewApptForm = ({ selectedServices }) => {
  const selectionMade = useRef(false);
  const [form, setForm] = useState({
    phone: "",
    name: "",
    email: "",
    date: "",
    time: "",
    technician: ""
  });

  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch customer suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const trimmed = form.phone.trim();
      if (trimmed.length < 3 && trimmed !== "*") {
        setSuggestions([]);
        return;
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

  // Fetch available technicians when services change
  useEffect(() => {
    const updateTechnicians = async () => {
      const categoryIds = [...new Set(selectedServices.map((svc) => svc.category_id))];
      try {
        const res = await TechnicianService.getAvailableTechnicians(categoryIds);
        const available = res.data;

        setTechnicianOptions(available);

        const stillValid = available.some((tech) => tech.name === form.technician);
        if (!stillValid) {
          setForm((prev) => ({ ...prev, technician: "" }));
        }
      } catch (err) {
        console.error("Error fetching technicians:", err);
        setTechnicianOptions([]);
        setForm((prev) => ({ ...prev, technician: "" }));
      }
    };

    if (selectedServices.length > 0) {
      updateTechnicians();
    } else {
      setTechnicianOptions([]);
      setForm((prev) => ({ ...prev, technician: "" }));
    }
  }, [selectedServices]);

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
    <form onSubmit={handleSubmit} className="new-appt-form">
      <h2 className="new-appt-title">New Appointment</h2>

      <div className="new-appt-form-grid">
        <div className="new-appt-suggestion-wrapper">
          <input
            type="tel"
            placeholder="Smart Search/ Phone Number"
            value={form.phone}
            onChange={handlePhoneChange}
            required
            className="new-appt-input"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="new-appt-form-suggestions">
              {suggestions.map((cust) => (
                <li
                  key={cust.id}
                  onClick={() => handleSelectSuggestion(cust)}
                  className="new-appt-form-suggestion-item"
                >
                  <div className="new-appt-suggestion-name">{cust.name}</div>
                  <div className="new-appt-suggestion-phone">{cust.phone}</div>
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
          className="new-appt-input"
        />

        <input
          type="email"
          placeholder="Email (optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="new-appt-input"
        />

        <select
          value={form.technician}
          onChange={(e) => setForm({ ...form, technician: e.target.value })}
          required
          className="new-appt-input"
        >
          <option value="">Select Technician</option>
          {technicianOptions.map((tech) => (
            <option key={tech.id} value={tech.name}>
              {tech.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
          className="new-appt-input"
        />

        <input
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
          className="new-appt-input"
        />
      </div>

      <div className="new-appt-services">
        <label className="new-appt-label">Selected Services</label>
        <ul className="new-appt-services-list">
          {selectedServices.length === 0 ? (
            <li>No services selected.</li>
          ) : (
            selectedServices.map((svc, idx) => <li key={idx}>{svc.name}</li>)
          )}
        </ul>
      </div>

      <button type="submit" className="new-appt-submit-btn">
        Submit
      </button>
    </form>
  );
};

export default NewApptForm;
