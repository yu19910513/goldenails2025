import React, { useState, useEffect } from 'react';
import './AppointmentTableBody.css';
import AppointmentService from '../../services/appointmentService';
import { sendCancellationNotification } from '../../common/utils';

const AppointmentTableBody = ({ appointments }) => {
  const [localAppointments, setLocalAppointments] = useState(appointments);

  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  const handleCancel = async (appointment) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    try {
      await AppointmentService.soft_delete(appointment.id);
      sendCancellationNotification(appointment);

      // Remove the appointment from local state
      setLocalAppointments(prev => prev.filter(appt => appt.id !== appointment.id));
    } catch (error) {
      alert("Failed to cancel appointment.");
      console.error(error);
    }
  };

  return (
    <tbody>
      {localAppointments.length > 0 ? (
        localAppointments.map((appt, index) => {
          const customer = appt.Customer || {};
          const services = appt.Services || [];
          const technicians = appt.Technicians || [];

          const serviceNames = services.map((s) => s.name).join(', ');
          const totalDuration = services.reduce((sum, s) => sum + (s.time || 0), 0);
          const estimatedTotalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0).toFixed(2);
          const technicianNames = technicians.map((t) => t.name).join(', ');

          const apptDateTime = new Date(`${appt.date}T${appt.start_service_time}`);
          const isPast = apptDateTime < new Date();
          const rowClass = `appointment-row ${isPast ? 'past-appointment' : 'future-appointment'}`;

          return (
            <tr key={appt.id || index} className={rowClass}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.email}</td>
              <td>{appt.date}</td>
              <td>{appt.start_service_time}</td>
              <td>{serviceNames}</td>
              <td>{totalDuration} mins</td>
              <td>{technicianNames}</td>
              <td>${estimatedTotalPrice}</td>
              <td>
                <button className="cancel-btn" onClick={() => handleCancel(appt)} disabled={isPast}>
                  Cancel Appt.
                </button>
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="10" className="no-appointments">No appointments found</td>
        </tr>
      )}
    </tbody>
  );
};

export default AppointmentTableBody;
