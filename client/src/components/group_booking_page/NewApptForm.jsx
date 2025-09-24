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
      if (!form.date || selectedServices.length === 0) return;

      console.log("selected services:", selectedServices);

      // Flatten service pool and distribute into appointment groups
      const servicePool = selectedServices.flatMap(svc => Array(svc.quantity).fill(svc));
      var appointments = distributeItems(servicePool, groupSize);
      console.log("distributed appointments:", appointments);
      // Remove any empty appointment arrays
      appointments = appointments.filter(appt => appt.length > 0);

      console.log("distributed appointments (non-empty):", appointments);

      if (appointments.length === 0) {
        setForm(prev => ({ ...prev, technician: "", time: "" }));
        setAvailableTimes([]);
        return;
      }

      try {
        // Step 1: For each appointment, get available technicians
        const appointmentTechMap = await Promise.all(
          appointments.map(async (appt) => {
            const categoryIds = [...new Set(appt.map(s => s.category_id))];
            const res = await TechnicianService.getAvailableTechnicians(categoryIds);
            return res.data; // array of techs who can perform all services in this appointment
          })
        );

        // Step 2: Assign technicians to appointments
        const assignedTechs = [];
        const usedTechs = new Set();

        for (const techOptions of appointmentTechMap) {
          // Prefer a tech not already used and not "No Preference"
          let assigned = techOptions.find(t => t.name !== "No Preference" && !usedTechs.has(t.name));

          // Only use "No Preference" if necessary
          if (!assigned) {
            assigned = techOptions.find(t => t.name === "No Preference");
          }

          if (assigned) {
            assignedTechs.push(assigned);
            if (assigned.name !== "No Preference") usedTechs.add(assigned.name);
          } else {
            assignedTechs.push(null); // fallback if no tech available
          }
        }

        console.log("assigned technicians:", assignedTechs.map(t => t?.name || "None"));

        // Step 3: Find common available time slots across all assigned technicians
        let commonSlots = null;

        for (let i = 0; i < assignedTechs.length; i++) {
          const tech = assignedTechs[i];
          if (!tech) continue;

          const appt = appointments[i];
          const res = await AppointmentService.findByTechId(tech.id);
          const techAppointments = res.data;
          const slots = calculateAvailableSlots(
            techAppointments,
            groupServicesByCategory(appt),
            form.date,
            getBusinessHours(form.date),
            tech
          );

          if (!commonSlots) {
            commonSlots = slots;
          } else {
            const slotTimes = new Set(slots.map(s => s.getTime()));
            commonSlots = commonSlots.filter(s => slotTimes.has(s.getTime()));
          }

        }

        // Step 4: Update form and available times
        if (commonSlots && commonSlots.length > 0) {
          setForm(prev => ({
            ...prev,
            technician: assignedTechs[0]?.name || "",
            time: formatTime(commonSlots[0]),
          }));
          setAvailableTimes(commonSlots);
        } else {
          setForm(prev => ({ ...prev, technician: "", time: "" }));
          setAvailableTimes([]);
        }

      } catch (err) {
        console.error("Error checking availability:", err);
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
