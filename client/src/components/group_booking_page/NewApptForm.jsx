import React, { useState, useEffect } from "react";
import AppointmentService from "../../services/appointmentService";
import { fetchAvailability } from "../../utils/helper_api";
import { formatTime } from "../../utils/helper";
import "./GroupBooking.css";

/**
 * NewApptForm component
 *
 * Renders a form to create one or more new group appointments.
 * Handles:
 * - Displaying customer info (phone, name, email).
 * - Selecting group size.
 * - Fetching available times from backend.
 * - Submitting valid appointment requests to the AppointmentService.
 *
 * @component
 *
 * @param {Object} props - Component props.
 * @param {Array<{ id: number|string, name: string, quantity: number }>} props.selectedServices
 *   The list of services selected by the user, each with quantity.
 * @param {Object} props.customerInfo
 *   Customer data, containing phone, name, email, and id.
 * @param {number} props.groupSize - The number of people in the group (1–4).
 * @param {Function} props.onGroupSizeChange - Callback fired when group size changes. Receives `(newSize: number)`.
 * @param {Function} props.onSubmitSuccess - Callback fired after successful appointment creation.
 *   Receives `(createdAppointments: Array<Object>)`.
 *
 * @example
 * <NewApptForm
 *   selectedServices={[{ id: 1, name: "Manicure", quantity: 2 }]}
 *   customerInfo={{ id: 123, phone: "555-1234", name: "Jane Doe", email: "jane@example.com" }}
 *   groupSize={2}
 *   onGroupSizeChange={(size) => console.log("Group size changed:", size)}
 *   onSubmitSuccess={(appointments) => console.log("Created:", appointments)}
 * />
 *
 * @returns {JSX.Element} The rendered NewApptForm component.
 */
const NewApptForm = ({
  selectedServices,
  customerInfo,
  groupSize,
  onGroupSizeChange,
  onSubmitSuccess
}) => {
  /**
   * Customer state, pre-filled if `customerInfo` is provided.
   * @type {[Object, Function]}
   */
  const [customer, setCustomer] = useState({
    phone: "",
    name: "",
    customer_id: "",
    email: "",
    date: ""
  });

  /** @type {[Array<Object>, Function]} Forms representing appointments to create */
  const [forms, setForms] = useState([]);

  /** @type {[Array<Date>, Function]} List of available times for the selected date/services */
  const [availableTimes, setAvailableTimes] = useState([]);

  /** @type {[boolean, Function]} Whether appointment submission is in progress */
  const [isAppointmentLoading, setIsAppointmentLoading] = useState(false);

  /**
   * Initialize customer info when `customerInfo` changes.
   */
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

  /**
   * Fetch technician/service availability whenever the date,
   * selected services, or group size changes.
   *
   * @async
   * @returns {Promise<void>}
   */
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

  /**
   * Validates the form data.
   *
   * @returns {boolean} True if all forms are valid (technician, time, and services selected).
   */
  const isFormValid = () => {
    return (
      forms.length > 0 &&
      forms.every(
        (f) => f.date && f.time && f.technician && f.services.length > 0
      )
    );
  };

  /**
   * Handles form submission.
   * Creates one appointment for each entry in `forms` by calling AppointmentService.
   *
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e - Form submit event.
   * @returns {Promise<void>}
   */
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
    <form onSubmit={handleSubmit} className="group-appt-form">
      <h2 className="group-appt-title">Book a New Appointment</h2>
      <small>
        Almost there! Submitting this form will confirm your request. Double-check your details and don’t forget to <b>select a time slot</b>.
        <span className="hide-on-desktop">
          <br />
          If you need to make changes, just tap the <b>Back</b> button to update your services.
        </span>
      </small>
      <div className="group-appt-form-grid">
        {/* Phone */}
        <div className="group-appt-field">
          <label className="group-appt-label">Phone</label>
          <input
            type="tel"
            value={customer.phone}
            readOnly
            className="group-appt-input read-only-input"
          />
        </div>

        {/* Customer Name */}
        <div className="group-appt-field">
          <label className="group-appt-label">Customer</label>
          <input
            type="text"
            value={customer.name}
            readOnly
            className="group-appt-input read-only-input"
          />
        </div>

        {/* Date */}
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

        {/* Group Size */}
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

        {/* Time */}
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
                      {time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Selected Services */}
      <div className="group-appt-services">
        <label className="group-appt-label">Selected Services </label>
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

      {/* Submit Button */}
      <button
        type="submit"
        className="group-appt-submit-btn"
        disabled={!isFormValid()}
      >
        Submit
      </button>

      {/* Loading Overlay */}
      {isAppointmentLoading && (
        <div className="group-appt-loading-overlay">
          Creating appointments...
        </div>
      )}
    </form>
  );
};

export default NewApptForm;
