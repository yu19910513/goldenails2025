import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationService from "../../services/notificationService"; // Assuming service exists
import "./GroupAppointmentConfirmation.css"; // The new, specific CSS file

const GroupAppointmentConfirmation = ({ appointments }) => {
  const navigate = useNavigate();

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
    <div className="group-appointment-confirmation">
      <h2 className="group-appointment-confirmation__title">Group Appointment Confirmed! 🥳</h2>
      <p className="group-appointment-confirmation__thank-you">
        Thank you, {customer.name}. Your booking for a group of {assignedTechnicians.length} is confirmed. We look forward to seeing you all!
      </p>
      <address className="group-appointment-confirmation__address">3610 Grandview St, Gig Harbor, WA 98335</address>
      
      <div className="group-appointment-confirmation__details-section">
        <p><strong>Date:</strong> {date}</p>
        <p><strong>Arrival Time:</strong> {time}</p>
        
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