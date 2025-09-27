import React, { useState, useEffect, useRef } from "react";
import TechnicianService from "../../services/technicianService";
import AppointmentService from "../../services/appointmentService";
import {
  calculateAvailableSlots,
  groupServicesByCategory,
  formatTime,
  getBusinessHours,
  distributeItems,
  assignTechnicians
} from "../../utils/helper";
import { getCommonAvailableSlots } from "../../utils/helper_api";
import "./NewApptForm.css";

const NewApptForm = ({
  selectedServices,
  customerInfo,
  groupSize,
  onGroupSizeChange,
  onSubmitSuccess,
  showForm
}) => {
  const [customer, setCustomer] = useState({
    phone: "",
    name: "",
    customer_id: "",
    email: "",
    date: ""
  });

  const [forms, setForms] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isAppointmentLoading, setIsAppointmentLoading] = useState(false);

  const techNameToId = useRef({});

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    if (customerInfo) {
      setCustomer({
        phone: customerInfo.phone || "",
        name: customerInfo.name || "",
        email: customerInfo.email || "",
        customer_id: customerInfo.id || "",
        date: today
      });
    }
  }, [customerInfo]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!customer.date || selectedServices.length === 0) {
        setForms([]);
        setAvailableTimes([]);
        return;
      }

      const servicePool = selectedServices.flatMap((svc) =>
        Array(svc.quantity).fill(svc)
      );
      let appointments = distributeItems(servicePool, groupSize);
      appointments = appointments.filter(
        (appt) => Array.isArray(appt) && appt.length > 0
      );
      if (appointments.length === 0) {
        setForms([]);
        setAvailableTimes([]);
        return;
      }

      try {
        const appointmentTechMap = await Promise.all(
          appointments.map(async (appt) => {
            const categoryIds = [...new Set(appt.map((s) => s.category_id))];
            const res = await TechnicianService.getAvailableTechnicians(
              categoryIds
            );
            return Array.isArray(res.data) ? res.data : [];
          })
        );

        const assignedTechs = assignTechnicians(appointmentTechMap);

        const commonSlots = await getCommonAvailableSlots(
          assignedTechs,
          appointments,
          customer.date
        );

        const generatedForms = appointments.map((appt, idx) => ({
          date: customer.date,
          time:
            commonSlots && commonSlots.length > 0
              ? formatTime(commonSlots[0])
              : "",
          technician: assignedTechs[idx]
            ? { id: assignedTechs[idx].id, name: assignedTechs[idx].name }
            : null,
          services: appt
        }));

        console.group("📋 checkAvailability()");
        console.log("Customer Info:", customer);
        console.log("Appointments (services grouped):", appointments);
        console.log("Assigned Technicians:", assignedTechs);
        console.log("Generated Forms:", generatedForms);
        console.groupEnd();

        setForms(generatedForms);
        setAvailableTimes(commonSlots || []);
      } catch (err) {
        console.error("Error checking availability:", err);
        setForms([]);
        setAvailableTimes([]);
      }
    };

    checkAvailability();
  }, [customer.date, selectedServices, groupSize]);

  const isFormValid = () => {
    return (
      forms.length > 0 &&
      forms.every(
        (f) => f.date && f.time && f.technician && f.services.length > 0
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert(
        "Please make sure all appointments have valid technician, time, and services."
      );
      return;
    }

    setIsAppointmentLoading(true);
    try {
      const createdAppointments = [];
      for (const f of forms) {
        if (!f.technician || !f.technician.id) {
          console.warn("Skipping form without technician:", f);
          continue;
        }

        const appointmentData = {
          customer_id: customer.customer_id,
          date: f.date,
          start_service_time: f.time,
          technician_id: f.technician.id,
          service_ids: f.services.map((s) => s.id)
        };
        console.log(appointmentData);

        const response = await AppointmentService.create(appointmentData);
        console.log("Appointment successfully created:", response.data);
        createdAppointments.push({
          ...f,
          customer: customer,
          id: response.data.id
        });
      }

      alert("Appointments successfully booked!");
      onSubmitSuccess(createdAppointments);
    } catch (err) {
      console.error("Error creating appointments:", err);
      alert("Failed to book appointments. Please try again.");
    } finally {
      setIsAppointmentLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="group-appt-form">
        <h2 className="group-appt-title">New Appointment</h2>

        <div className="group-appt-form-grid">
          <div className="group-appt-field">
            <label className="group-appt-label">Phone</label>
            <input
              type="tel"
              value={customer.phone}
              readOnly
              className="group-appt-input read-only-input"
            />
          </div>

          <div className="group-appt-field">
            <label className="group-appt-label">Customer</label>
            <input
              type="text"
              value={customer.name}
              readOnly
              className="group-appt-input read-only-input"
            />
          </div>

          <div className="group-appt-field">
            <label className="group-appt-label">Date</label>
            <input
              type="date"
              value={customer.date}
              onChange={(e) =>
                setCustomer({ ...customer, date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              className="group-appt-input"
            />
          </div>

          <div className="group-appt-field">
            <label className="group-appt-label">Group Size</label>
            <select
              value={groupSize}
              onChange={(e) => onGroupSizeChange(parseInt(e.target.value))}
              className="group-appt-input"
            >
              {[...Array(4).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Only show time if at least one service is selected */}
          {selectedServices.length > 0 && (
            <div className="group-appt-field">
              <label className="group-appt-label">Time</label>
              <select
                value={forms[0]?.time || ""}
                onChange={(e) => {
                  const newTime = e.target.value;
                  setForms(forms.map((f) => ({ ...f, time: newTime })));
                }}
                className="group-appt-input"
                required
                disabled={availableTimes.length === 0}
              >
                {availableTimes.length === 0 ? (
                  <option value="">No available time slots</option>
                ) : (
                  <>
                    <option value="">Select Time</option>
                    {availableTimes.map((time, idx) => (
                      <option key={idx} value={formatTime(time)}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        <div className="group-appt-services">
          <label className="group-appt-label">Selected Services</label>
          <ul className="group-appt-services-list">
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
          className="group-appt-submit-btn"
          disabled={!isFormValid()}
        >
          Submit
        </button>

        {isAppointmentLoading && (
          <div className="group-appt-loading-overlay">
            Creating appointments...
          </div>
        )}
      </form>

      {showForm && (
        <button
          type="submit"
          className="group-appt-submit-circle"
          disabled={!isFormValid()}
        >
          Submit
        </button>
      )}
    </>
  );
};

export default NewApptForm;
