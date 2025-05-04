import React, { useState, useEffect, useRef } from "react";
import CustomerService from "../../../services/customerService";
import TechnicianService from "../../../services/technicianService";
import AppointmentService from "../../../services/appointmentService";
import { calculateAvailableSlots, groupServicesByCategory } from "../../../common/utils";
import "./NewApptForm.css";

const NewApptForm = ({ selectedServices }) => {
  const selectionMade = useRef(false);
  const techNameToId = useRef({});
  const [form, setForm] = useState({
    phone: "",
    name: "",
    email: "",
    date: "",
    time: "",
    technician: ""
  });

  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  useEffect(() => {
    const updateTechnicians = async () => {
      const categoryIds = [...new Set(selectedServices.map((svc) => svc.category_id))];
      try {
        const res = await TechnicianService.getAvailableTechnicians(categoryIds);
        const available = res.data;
        techNameToId.current = Object.fromEntries(available.map(tech => [tech.name, tech.id]));
        setTechnicianOptions(available);
      } catch (err) {
        console.error("Error fetching technicians:", err);
        setTechnicianOptions([]);
      }
    };

    if (selectedServices.length > 0) {
      updateTechnicians();
    } else {
      setTechnicianOptions([]);
      setForm((prev) => ({ ...prev, technician: "", time: "" }));
    }
  }, [selectedServices]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!form.date || !selectedServices.length || !technicianOptions.length) return;

      const selectedDate = form.date;
      const businessHours = { start: 9, end: 19 };
      const availableTechs = [];
      const techSlotsMap = {};

      for (let tech of technicianOptions) {
        const techId = techNameToId.current[tech.name];
        try {
          const res = await AppointmentService.findByTechId(techId);
          const appointments = res.data;
          const slots = calculateAvailableSlots(
            appointments,
            groupServicesByCategory(selectedServices),
            selectedDate,
            businessHours,
            tech
          );
          if (slots.length > 0) {
            availableTechs.push(tech);
            techSlotsMap[tech.name] = slots;
          }
        } catch (err) {
          console.error(`Error checking availability for ${tech.name}`, err);
        }
      }

      setTechnicianOptions(availableTechs);

      if (form.technician && techSlotsMap[form.technician]) {
        setAvailableTimes(techSlotsMap[form.technician]);
      } else if (availableTechs.length > 0) {
        const defaultTech = availableTechs[0].name;
        setForm((prev) => ({
          ...prev,
          technician: defaultTech,
          time: formatTime(techSlotsMap[defaultTech][0])
        }));
        setAvailableTimes(techSlotsMap[defaultTech]);
      } else {
        setForm((prev) => ({ ...prev, technician: "", time: "" }));
        setAvailableTimes([]);
      }
    };

    checkAvailability();
  }, [form.date, selectedServices]);

  useEffect(() => {
    const fetchTechAvailability = async () => {
      if (!form.date || !form.technician) return;

      const tech = technicianOptions.find(t => t.name === form.technician);
      if (!tech) return;

      const techId = techNameToId.current[tech.name];
      const businessHours = { start: 9, end: 19 };

      try {
        const res = await AppointmentService.findByTechId(techId);
        const appointments = res.data;
        const slots = calculateAvailableSlots(
          appointments,
          groupServicesByCategory(selectedServices),
          form.date,
          businessHours,
          tech
        );

        setAvailableTimes(slots);
        if (!slots.some((slot) => formatTime(slot) === form.time)) {
          setForm((prev) => ({ ...prev, time: slots.length > 0 ? formatTime(slots[0]) : "" }));
        }
      } catch (err) {
        console.error(`Error updating availability for selected technician: ${tech.name}`, err);
      }
    };

    fetchTechAvailability();
  }, [form.technician]);

  const formatTime = (dateObj) => {
    const hrs = String(dateObj.getHours()).padStart(2, "0");
    const mins = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hrs}:${mins}`;
  };

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

        <select
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
          className="new-appt-input"
        >
          <option value="">Select Time</option>
          {availableTimes.map((time, idx) => (
            <option key={idx} value={formatTime(time)}>
              {formatTime(time)}
            </option>
          ))}
        </select>
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
