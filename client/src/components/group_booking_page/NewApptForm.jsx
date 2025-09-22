import React, { useState, useEffect, useRef } from "react";
import TechnicianService from "../../services/technicianService";
import AppointmentService from "../../services/appointmentService";
import {
  calculateAvailableSlots,
  groupServicesByCategory,
  formatTime,
  getBusinessHours,
  distributeItems
} from "../../utils/helper";
import "./NewApptForm.css";

const NewApptForm = ({ selectedServices, customerInfo, groupSize, onGroupSizeChange }) => {
  const [form, setForm] = useState({
    phone: "",
    name: "",
    customer_id: "",
    email: "",
    date: "",
    time: "",
    technician: "",
  });
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isAppointmentLoading, setIsAppointmentLoading] = useState(false);
  const techNameToId = useRef({});

  // Populate customer info
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (customerInfo) {
      setForm((prev) => ({
        ...prev,
        date: today,
        phone: customerInfo.phone || "",
        name: customerInfo.name || "",
        email: customerInfo.email || "",
        customer_id: customerInfo.id || "",
      }));
    }
  }, [customerInfo]);

  // Fetch technician availability whenever date or selected services change
  useEffect(() => {
    const checkAvailability = async () => {
      console.log("selected services: ");
      console.log(selectedServices);
      const servicePool = selectedServices.flatMap(svc => Array(svc.quantity).fill(svc));
      var appointments = distributeItems(servicePool, groupSize)
      console.log("appointments: ");
      console.log(appointments);
      
      
      
      if (!form.date || selectedServices.length === 0) return;
      const categoryIds = [...new Set(selectedServices.map((svc) => svc.category_id))];
      try {
        const res = await TechnicianService.getAvailableTechnicians(categoryIds);
        const allTechnicians = res.data;
        console.log("available techs: ");
        console.log(allTechnicians);
        
        techNameToId.current = Object.fromEntries(
          allTechnicians.map((tech) => [tech.name, tech.id])
        );
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

        if (availableTechs.length > 0) {
          const defaultTech = availableTechs[0].name;
          const timeToSet = formatTime(techSlotsMap[defaultTech][0]);
          setForm((prev) => ({
            ...prev,
            technician: defaultTech,
            time: timeToSet,
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

      const appointmentData = {
        customer_id: form.customer_id,
        date: form.date,
        start_service_time: form.time,
        technician_id: technicianId,
        service_ids: selectedServices.flatMap((svc) =>
          Array(svc.quantity).fill(svc.id)
        ), // repeat service id by quantity
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
        <input
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          readOnly
          disabled
          className="new-appt-input"
        />
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          readOnly
          disabled
          className="new-appt-input"
        />

        {/* ✅ Group Size Selector (user can change it, not fixed anymore) */}
        <select
          value={groupSize}
          onChange={(e) => onGroupSizeChange(parseInt(e.target.value))}
          className="new-appt-input"
        >
          {[...Array(4).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>
              Group Size: {i + 1}
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
            selectedServices.map((svc) => (
              <li key={svc.id}>
                {svc.name} x {svc.quantity}
              </li>
            ))
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
