import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationService from "../../services/notificationService"; // Assuming service exists
import "./GroupAppointmentConfirmation.css"; // The new, specific CSS file

const GroupAppointmentConfirmation = ({ appointments }) => {
  const navigate = useNavigate();
  const groupSize = appointments.length;
  const address = "3610 Grandview St, Gig Harbor, WA 98335";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  // Guard clause for empty or invalid appointments prop
  if (!appointments || appointments.length === 0) {
    return (
      <div className="group-appointment-confirmation">
        <h2 className="group-appointment-confirmation__title">Booking Confirmation Error</h2>
        <p>There was an issue retrieving your appointment details. Please return home and try again.</p>
      </div>
    );
  }

  // --- Data Aggregation ---
  // Since date, time, and customer are the same for the whole group, we can take them from the first appointment.
  const { customer, date, time } = appointments[0];

  // 1. Aggregate all services into a single list with total counts.
  const totalServices = appointments
    .flatMap((appt) => appt.services) // Get a single array of all service objects
    .reduce((acc, service) => {
      // Group by service name and sum the quantities
      acc[service.name] = (acc[service.name] || 0) + 1;
      return acc;
    }, {}); // Result: { "Manicure": 2, "Pedicure": 1 }

  // 2. Get a unique list of all assigned technicians.
  const assignedTechnicians = [
    ...new Set(appointments.map((appt) => appt.technician.name)),
  ];
  /**
 * This effect sends a single, consolidated notification for the entire group booking.
 */
  useEffect(() => {
    const sendGroupNotification = async () => {
      try {
        const messageData = {
          recipient_name: customer.name,
          recipient_phone: customer.phone,
          recipient_email_address: customer.email,
          recipient_email_subject: "Your Group Appointment is Confirmed!",
          action: "confirm", // Or a new "group_confirm" action
          appointment_date: new Date(date).toLocaleDateString([], {
            weekday: 'long', month: 'long', day: 'numeric'
          }),
          appointment_start_time: time,
          appointment_services: Object.entries(totalServices)
            .map(([name, count]) => `${name} (x${count})`)
            .join(", "),
          appointment_technician: assignedTechnicians.join(", "),
          owner_email_subject: `New Group Appointment for ${customer.name}`,
        };
        // await NotificationService.notify(messageData);
        console.log("Sending consolidated group notification:", messageData);
      } catch (error) {
        console.error("Failed to send group notification:", error);
      }
    };
    sendGroupNotification();
  }, [appointments, customer, date, time, totalServices, assignedTechnicians]);

  return (
    <div
      className="group-appointment-confirmation"
      style={{ '--group-size-watermark': `'${groupSize}'` }} // <-- Pass as CSS variable
    >
      <h2 className="group-appointment-confirmation__title">Group Appointment Confirmed! 🥳</h2>

      <p className="group-appointment-confirmation__thank-you">
        Thank you, {customer.name}. Your booking for a group of {groupSize} is confirmed. We look forward to seeing you all!
      </p>

      <p className="group-appointment-confirmation__details-intro">
        Please find your appointment details below. We kindly ask that you arrive 5 minutes early and check in at the following address:
      </p>

      <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
        <address className="group-appointment-confirmation__address">
          {address}
        </address>
      </a>

      <div className="group-appointment-confirmation__details-section">
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Arrival Time:</strong> {time}</p>
        <p><strong>Group Size:</strong> {groupSize}</p>
        <hr className="group-appointment-confirmation__divider" />
        <p><strong>Total Services:</strong></p>
        <ul className="group-appointment-confirmation__service-list">
          {Object.entries(totalServices).map(([name, count]) => (
            <li key={name}>{name} x {count}</li>
          ))}
        </ul>

        <p><strong>Your Technicians:</strong></p>
        <ul className="group-appointment-confirmation__service-list">
          {assignedTechnicians.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>

      <p className="group-appointment-confirmation__instructions">
        To review or manage your appointment details, please use the 'Appointment History' section in the top navigation bar. Simply enter your phone number and name to access your records.
        Should there be any changes to your appointment, we will notify you via phone or text and update your online appointment record accordingly.
        If you need to cancel or modify your appointment, you may use the 'Appointment History' to do so or contact us at <strong>253-851-7563</strong>.
      </p>

      <button
        className="group-appointment-confirmation__home-button"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      ></button>
    </div>
  );
};

export default GroupAppointmentConfirmation;