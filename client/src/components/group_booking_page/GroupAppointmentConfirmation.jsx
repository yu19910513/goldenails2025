import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationService from "../../services/notificationService";
import {
  formatStartTime,
  formatDate,
  buildNotificationData,
  copySessionToLocal
} from "../../utils/helper";
import "./GroupAppointmentConfirmation.css";

/**
 * Renders a confirmation page for a group booking.
 * It aggregates details from multiple individual appointments into a single summary view,
 * displays the consolidated information, and triggers a confirmation notification.
 *
 * @param {object} props - The component props.
 * @param {Array<object>} props.appointments - An array of appointment objects for the group.
 * @param {object} props.appointments[].customer - Customer details (assumed to be the same for the group).
 * @param {string} props.appointments[].customer.name - The customer's full name.
 * @param {string} props.appointments[].date - The appointment date (e.g., "YYYY-MM-DD").
 * @param {string} props.appointments[].time - The appointment start time (e.g., "HH:MM:SS").
 * @param {Array<object>} props.appointments[].services - A list of services for this specific appointment.
 * @param {string} props.appointments[].services[].name - The name of the service.
 * @param {object} props.appointments[].technician - The technician assigned to this appointment.
 * @param {string} props.appointments[].technician.name - The technician's name.
 * @returns {JSX.Element} The group appointment confirmation component.
 */
const GroupAppointmentConfirmation = ({ appointments }) => {
  const navigate = useNavigate();
  const address = "3610 Grandview St, Gig Harbor, WA 98335";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;

  if (!appointments || appointments.length === 0) {
    return (
      <div className="group-appointment-confirmation">
        <h2 className="group-appointment-confirmation__title">
          Booking Confirmation Error
        </h2>
        <p>
          There was an issue retrieving your appointment details. Please return
          home and try again.
        </p>
      </div>
    );
  }

  const groupSize = appointments.length;
  const { customer, date, time } = appointments[0];
  const appt_date = formatDate(date);
  const start_time = formatStartTime(time);

  const totalServices = appointments
    .flatMap((appt) => appt.services)
    .reduce((acc, service) => {
      acc[service.name] = (acc[service.name] || 0) + 1;
      return acc;
    }, {});

  const assignedTechnicians = [
    ...new Set(appointments.map((appt) => appt.technician.name)),
  ];

  useEffect(() => {
    const sendGroupNotification = async () => {
      try {
        const optInSMS = localStorage.getItem("smsOptIn") !== "false";
        const servicesSummary = Object.entries(totalServices)
          .map(([name, count]) => `${name} (x${count})`)
          .join(", ");

        const messageData = buildNotificationData(
          {
            customerInfo: customer,
            technician: { name: assignedTechnicians.join(", ") },
          },
          optInSMS,
          appt_date,
          start_time,
          null,
          [servicesSummary]
        );

        await NotificationService.notify(messageData);
        console.log("Sending consolidated group notification:", messageData);
      } catch (error) {
        console.error("Failed to send group notification:", error);
      }
    };
    sendGroupNotification();
  }, [appointments]); // Effect runs only when the core appointments data changes.

  return (
    <div
      className="group-appointment-confirmation"
      style={{ "--group-size-watermark": `'${groupSize}'` }}
    >
      <h2 className="group-appointment-confirmation__title">
        Group Appointment Confirmed! 🥳
      </h2>

      <p className="group-appointment-confirmation__thank-you">
        Thank you, {customer.name}. Your booking for a group of {groupSize} is
        confirmed. We look forward to seeing you all!
      </p>

      <p className="group-appointment-confirmation__details-intro">
        Please find your appointment details below. We kindly ask that you
        arrive 5 minutes early and check in at the following address:
      </p>

      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
        <address className="group-appointment-confirmation__address">
          {address}
        </address>
      </a>

      <div className="group-appointment-confirmation__details-section">
        <p>
          <strong>Date:</strong> {appt_date}
        </p>
        <p>
          <strong>Arrival Time:</strong> {start_time}
        </p>
        <p>
          <strong>Group Size:</strong> {groupSize}
        </p>
        <hr className="group-appointment-confirmation__divider" />
        <p>
          <strong>Total Services:</strong>
        </p>
        <ul className="group-appointment-confirmation__service-list">
          {Object.entries(totalServices).map(([name, count]) => (
            <li key={name}>
              {name} x {count}
            </li>
          ))}
        </ul>

        <p>
          <strong>Your Technicians:</strong>
        </p>
        <ul className="group-appointment-confirmation__service-list">
          {assignedTechnicians.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>

      <p className="group-appointment-confirmation__instructions">
        To review or manage your appointment details, please use the 'Appointment
        History' section in the top navigation bar. Simply enter your phone
        number and name to access your records. Should there be any changes to
        your appointment, we will notify you via phone or text and update your
        online appointment record accordingly. If you need to cancel or modify
        your appointment, you may use the 'My Visits' to do so or
        contact us at <strong>253-851-7563</strong>.
      </p>

      <button
        className="group-appointment-confirmation__home-button"
        onClick={() => {
          localStorage.clear();
          copySessionToLocal('activePromoKey');
          navigate("/");
        }}
      >
      </button>
    </div>
  );
};

export default GroupAppointmentConfirmation;