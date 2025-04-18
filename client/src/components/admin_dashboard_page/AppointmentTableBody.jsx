import React from 'react';
import './AppointmentTableBody.css';

const AppointmentTableBody = ({ appointments }) => {
  return (
    <tbody>
      {appointments.length > 0 ? (
        appointments.map((appt, index) => {
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
            <tr key={index} className={rowClass}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{customer.email}</td>
              <td>{appt.date}</td>
              <td>{appt.start_service_time}</td>
              <td>{serviceNames}</td>
              <td>{totalDuration} mins</td>
              <td>{technicianNames}</td>
              <td>${estimatedTotalPrice}</td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="9" className="no-appointments">No appointments found</td>
        </tr>
      )}
    </tbody>
  );
};

export default AppointmentTableBody;
