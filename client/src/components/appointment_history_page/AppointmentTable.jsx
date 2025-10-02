import React from 'react';
import { sendCancellationNotification } from '../../utils/helper';
import AppointmentService from '../../services/appointmentService';

/**
 * Component to display a table of appointments.
 * Supports grouping appointments by date and start time,
 * displaying multiple technicians and services,
 * and optionally allows cancellation of appointments.
 * 
 * @param {Object} props - Component props.
 * @param {Array<Object>} props.appointmentsList - List of appointment objects to display.
 * @param {boolean} props.showCancel - Whether to show the cancel button column.
 * @param {Object} props.customerInfo - Information about the customer.
 * @param {function} props.fetchAppointments - Function to refetch appointments after cancellation.
 * @param {function} props.getAppointmentClass - Function to return a CSS class for an appointment row.
 * @returns {JSX.Element} Rendered appointment table component.
 */
const AppointmentTable = ({ appointmentsList, showCancel, customerInfo, fetchAppointments, getAppointmentClass }) => {

    /**
     * Groups appointments by date and start_service_time.
     * Combines technicians and services for appointments with the same date and time.
     * 
     * @param {Array<Object>} appointmentsList - List of appointment objects.
     * @returns {Array<Object>} Grouped appointments.
     */
    const groupAppointmentsByTime = (appointmentsList) => {
        const groupedMap = {};
        appointmentsList.forEach((appt) => {
            const key = `${appt.date}_${appt.start_service_time}`;
            if (!groupedMap[key]) groupedMap[key] = { ...appt, Technicians: [], Services: [] };
            groupedMap[key].Technicians.push(...appt.Technicians);
            groupedMap[key].Services.push(...appt.Services);
        });
        return Object.values(groupedMap);
    };

    /**
     * Handles cancellation of an appointment.
     * Cancels all appointments that share the same date and start_service_time.
     * Sends a cancellation notification and refetches appointments.
     * 
     * @param {Object} appointment - The appointment object to cancel.
     */
    const handleCancel = async (appointment) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
        if (!confirmCancel) return;

        try {
            const apptsToCancel = appointmentsList.filter(
                (a) => a.date === appointment.date && a.start_service_time === appointment.start_service_time
            );
            for (const appt of apptsToCancel) {
                await AppointmentService.soft_delete(appt.id);
            }
            alert("Appointment successfully canceled.");
            sendCancellationNotification({ ...appointment, Customer: customerInfo });
            fetchAppointments(customerInfo.id);
        } catch (error) {
            alert("Failed to cancel appointment.");
            console.error(error);
        }
    };

    if (!appointmentsList.length) return <p>No appointments found.</p>;

    const groupedAppointments = groupAppointmentsByTime(appointmentsList);

    return (
        <table className="appointment-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Technician(s)</th>
                    <th>Services</th>
                    {showCancel && <th>Action</th>}
                </tr>
            </thead>
            <tbody>
                {groupedAppointments.map((appointment, index) => (
                    <tr key={index} className={getAppointmentClass(appointment)}>
                        <td>{appointment.date}, {appointment.start_service_time}</td>
                        <td>
                            {appointment.Technicians.map(t => t.name).join(', ')}
                            {appointment.Technicians.length > 1 && (
                                <div className="group-label">
                                    (Group booking with {appointment.Technicians.length} technicians)
                                </div>
                            )}
                        </td>
                        <td>
                            {appointment.Services.map((s, idx) => <div key={idx}>{s.name}</div>)}
                        </td>
                        {showCancel && (
                            <td>
                                <button className="cancel-btn" onClick={() => handleCancel(appointment)}>Cancel Appt.</button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AppointmentTable;
