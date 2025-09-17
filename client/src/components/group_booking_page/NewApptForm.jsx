import React, { useState, useEffect, useRef } from "react";
import TechnicianService from "../../services/technicianService";
import AppointmentService from "../../services/appointmentService";
import {
  calculateAvailableSlots,
  groupServicesByCategory,
  formatTime,
  getBusinessHours,
} from "../../utils/helper";
import "./NewApptForm.css";

const NewApptForm = ({ selectedServices, customerInfo, groupSize }) => {
  // Local state to manage group size, initialized from the prop
  const [internalGroupSize, setInternalGroupSize] = useState(groupSize || 1);
  
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
  const [isAppointmentLoading, setIsAppointmentLoading] = useState(false);

  // Syncs the internal state if the incoming prop changes
  useEffect(() => {
    setInternalGroupSize(groupSize || 1);
  }, [groupSize]);

  // EFFECT 1: Populate form with customer info
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (customerInfo) {
      setForm((prev) => ({
        ...prev,
        date: today,
        phone: customerInfo.phone || "",
        name: customerInfo.name || "",
        email: customerInfo.email || "",
        customer_id: customerInfo.id || ""
      }));
    }
  }, [customerInfo]);

  // EFFECT 2: Check technician availability (UNCHANGED)
  useEffect(() => {
    const checkAvailability = async () => {
      if (!form.date || selectedServices.length === 0) return;
      // ... (rest of the function is unchanged)
      const categoryIds = [...new Set(selectedServices.map((svc) => svc.category_id))];
      try {
        const res = await TechnicianService.getAvailableTechnicians(categoryIds);
        const allTechnicians = res.data;
        techNameToId.current = Object.fromEntries(allTechnicians.map(tech => [tech.name, tech.id]));
        const availableTechs = [];
        const techSlotsMap = {};
        for (let tech of allTechnicians) {
          const techId = techNameToId.current[tech.name];
          try {
            const res = await AppointmentService.findByTechId(techId);
            const appointments = res.data;
            const slots = calculateAvailableSlots(
              appointments,
              groupServicesByCategory(selectedServices),
              form.date,
              getBusinessHours(form.date),
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
          const timeToSet = formatTime(techSlotsMap[defaultTech][0]);
          setForm((prev) => ({
            ...prev,
            technician: defaultTech,
            time: timeToSet
          }));
          setAvailableTimes(techSlotsMap[defaultTech]);
        } else {
          setForm((prev) => ({ ...prev, technician: "", time: "" }));
          setAvailableTimes([]);
        }
      } catch (err) {
        console.error("Error checking technician availability:", err);
      }
    };
    checkAvailability();
  }, [form.date, selectedServices]);

  // EFFECT 3: Update available times for selected technician (UNCHANGED)
  useEffect(() => {
    const fetchTechAvailability = async () => {
      if (!form.date || !form.technician) return;
      // ... (rest of the function is unchanged)
      const tech = technicianOptions.find(t => t.name === form.technician);
      if (!tech) return;
      const techId = techNameToId.current[tech.name];
      try {
        const res = await AppointmentService.findByTechId(techId);
        const appointments = res.data;
        const slots = calculateAvailableSlots(
          appointments,
          groupServicesByCategory(selectedServices),
          form.date,
          getBusinessHours(form.date),
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
    if (technicianOptions.length > 0) {
        fetchTechAvailability();
    }
  }, [form.technician]);

  const isFormValid = () => {
    return (
      form.customer_id &&
      form.date.trim() !== "" &&
      form.time.trim() !== "" &&
      form.technician.trim() !== "" &&
      selectedServices.length > 0
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const technicianId = techNameToId.current[form.technician];
      if (!technicianId) {
        alert("Please select a valid technician.");
        return;
      }
      
      let appointmentData = {
        customer_id: form.customer_id,
        date: form.date,
        start_service_time: form.time,
        technician_id: technicianId,
        service_ids: selectedServices.map((svc) => svc.id),
        notes: `Group booking of ${internalGroupSize}.` // Use internal state here
      };

      setIsAppointmentLoading(true);
      await AppointmentService.create(appointmentData);
      alert("Appointment successfully booked!");
      
    } catch (err) {
      console.error("Error creating appointment:", err);
      alert("Failed to book the appointment. Please try again.");
    } finally {
      setIsAppointmentLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="new-appt-form">
      <h2 className="new-appt-title">New Appointment</h2>
      <div className="new-appt-form-grid">
        <input type="tel" placeholder="Phone Number" value={form.phone} readOnly disabled className="new-appt-input" />
        <input type="text" placeholder="Name" value={form.name} readOnly disabled className="new-appt-input" />

        <select
          value={internalGroupSize} // Use internal state for value
          onChange={(e) => setInternalGroupSize(parseInt(e.target.value, 10))} // Update internal state
          required
          className="new-appt-input"
        >
          {[1, 2, 3, 4, 5, 6].map(num => (
            <option key={num} value={num}>
              Group Size: {num}
            </option>
          ))}
        </select>
        
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
          min={new Date().toISOString().split("T")[0]}
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

      {isAppointmentLoading && (
        <div className="loading-overlay">Creating appointment...</div>
      )}
    </form>
  );
};

export default NewApptForm;