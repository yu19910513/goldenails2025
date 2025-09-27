import React, { useState, useEffect } from "react";
import AppointmentService from "../../services/appointmentService";
import { fetchAvailability } from "../../utils/helper_api";
import { formatTime } from "../../utils/helper";
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

  const resetFormsAndTimes = () => {
    setForms([]);
    setAvailableTimes([]);
  };

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
      console.group("📋 checkAvailability()");
      const { forms, times } = await fetchAvailability(customer.date, selectedServices, groupSize);
      console.log("Customer Info:", customer);
      console.log("Generated Forms:", forms);
      console.groupEnd();
      setForms(forms);
      setAvailableTimes(times);
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

        {showForm && (
          <button
            type="submit"
            className="group-appt-submit-circle"
            disabled={!isFormValid()}
          >
            Submit
          </button>
        )}
      </form>
    </>
  );
};

export default NewApptForm;
