import React, { useState, useEffect, useRef } from "react";
import CustomerService from "../../../services/customerService";
import TechnicianService from "../../../services/technicianService";
import AppointmentService from "../../../services/appointmentService";
import {
  calculateAvailableSlots,
  groupServicesByCategory,
  formatTime,
  replaceEmptyStringsWithNull,
  areCommonValuesEqual
} from "../../../common/utils";
import "./NewApptForm.css";

const NewApptForm = ({ selectedServices }) => {
  const selectionMade = useRef(false);
  const techNameToId = useRef({});
  const [form, setForm] = useState({
    phone: "",
    name: "",
    customer_id: "",
    email: "",
    date: "",
    time: "",
    technician: ""
  });

  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({});

  /**
   * Fetches customer suggestions based on the current phone input.
   * Triggers when `form.phone` changes.
   * 
   * - Ignores input shorter than 3 characters unless it's "*".
   * - Skips if a previous suggestion was just selected.
   * - Calls the `CustomerService.smart_search` API and updates suggestions.
   */
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

  /**
   * Updates the list of available technicians based on selected service categories.
   * Triggers when `selectedServices` changes.
   * 
   * - Extracts unique `category_id`s from selected services.
   * - Calls `TechnicianService.getAvailableTechnicians` to fetch matching technicians.
   * - Sets `technicianOptions` state and a map of tech names to their IDs.
   * - Clears technician/time selection if no services are selected.
   */
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

  /**
   * Checks appointment availability for each technician on the selected date.
   * Triggers when `form.date` or `selectedServices` changes.
   * 
   * - Fetches existing appointments for each technician.
   * - Uses `calculateAvailableSlots` to determine open time slots.
   * - Sets `technicianOptions` and `availableTimes` based on results.
   * - Auto-selects the first available technician and time if none is chosen.
   */
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

  /**
   * Updates available time slots when a technician is selected or changed.
   * Triggers when `form.technician` changes.
   * 
   * - Fetches technician's appointments.
   * - Recalculates available slots using `calculateAvailableSlots`.
   * - Updates `availableTimes` and resets `form.time` if current time is no longer valid.
   */
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

  const isFormValid = () => {
    const phone = form.phone.trim();
    const isPhoneValid = /^\d{10,15}$/.test(phone); // allows 10 to 15 digits, adjust as needed
    return (
      isPhoneValid &&
      form.name.trim() !== "" &&
      form.date.trim() !== "" &&
      form.time.trim() !== "" &&
      form.technician.trim() !== "" &&
      selectedServices.length > 0
    );
  };

  const handleSelectSuggestion = (customer) => {
    selectionMade.current = true;
    setForm({
      ...form,
      phone: customer.phone || "",
      name: customer.name || "",
      email: customer.email || "",
      customer_id: customer.id || ""
    });
    setSelectedCustomer(customer);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handlePhoneChange = (e) => {
    setForm({
      ...form,
      phone: e.target.value,
      email: ""
    });
  };

  const formMatchesSelectedCustomer = () => {
    return areCommonValuesEqual(selectedCustomer, replaceEmptyStringsWithNull(form));
  };
  
  /**
   * Handles the form submission for booking an appointment.
   * 
   * Prevents default form behavior, validates technician selection,
   * checks if the form matches an existing customer, and if not,
   * attempts to update or create the customer before booking the appointment.
   * 
   * Upon successful booking, the form and related UI state are reset.
   * 
   * Alerts the user in case of any validation errors or service failures.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   *
   * @returns {Promise<void>} Does not return a value; performs side effects like API calls, form reset, and user alerts.
   *
   * @example
   * <form onSubmit={handleSubmit}>...</form>
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const technicianId = techNameToId.current[form.technician];

      if (!technicianId) {
        alert("Please select a valid technician.");
        return;
      }

      let appointmentData = {
        customer_id: form.customer_id, // You may want to map this to a real customer_id if the customer already exists
        date: form.date,
        start_service_time: form.time,
        technician_id: technicianId,
        service_ids: selectedServices.map((svc) => svc.id)
      };

      if (!formMatchesSelectedCustomer()) {
        try {
          const res = await CustomerService.updateOrCreate(replaceEmptyStringsWithNull(form));
          if (!res?.data?.id) {
            throw new Error("Customer creation failed");
          }
          appointmentData.customer_id = res.data.id;
        } catch (customerErr) {
          console.error("Error updating/creating customer:", customerErr);
          alert("Customer information could not be saved.");
          return;
        }
      }

      const response = await AppointmentService.create(appointmentData);
      console.log("Appointment successfully created:", response.data);
      alert("Appointment successfully booked!");

      // Optionally reset the form
      setForm({
        phone: "",
        name: "",
        email: "",
        date: "",
        time: "",
        technician: "",
        customer_id: ""
      });
      setAvailableTimes([]);
      setSuggestions([]);
      setShowSuggestions(false);

    } catch (err) {
      console.error("Error creating appointment:", err);
      alert("Failed to book the appointment. Please try again.");
    }
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
          disabled
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

      <button
        type="submit"
        className="new-appt-submit-btn"
        disabled={!isFormValid()}
      >
        Submit
      </button>
    </form>
  );
};

export default NewApptForm;
