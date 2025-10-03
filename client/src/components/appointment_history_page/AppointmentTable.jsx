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
 * Groups a list of appointments by their date and start time.
 * 
 * - Appointments with the same `date` and `start_service_time` are merged.
 * - Technicians from each merged appointment are combined into a single array.
 * - Services from each merged appointment are merged, and duplicate service names
 *   are consolidated with a `count` property (e.g., "Essential Manicure x 2").
 *
 * @param {Array<Object>} appointmentsList - The list of appointment objects to group.
 * @param {string} appointmentsList[].date - The appointment date (YYYY-MM-DD).
 * @param {string} appointmentsList[].start_service_time - The service start time (HH:mm).
 * @param {Array<Object>} appointmentsList[].Technicians - Array of technician objects.
 * @param {Array<Object>} appointmentsList[].Services - Array of service objects.
 * @returns {Array<Object>} An array of grouped appointment objects where:
 *   - `Technicians` is a combined list of all technicians.
 *   - `Services` is a deduplicated list of services with an added `count` property.
 *
 * @example
 * const grouped = groupAppointmentsByTime([
 *   {
 *     date: "2025-10-05",
 *     start_service_time: "10:00",
 *     Technicians: [{ name: "Jane" }],
 *     Services: [{ name: "Manicure" }]
 *   },
 *   {
 *     date: "2025-10-05",
 *     start_service_time: "10:00",
 *     Technicians: [{ name: "Anna" }],
 *     Services: [{ name: "Manicure" }, { name: "Pedicure" }]
 *   }
 * ]);
 *
 * // Result:
 * // [
 * //   {
 * //     date: "2025-10-05",
 * //     start_service_time: "10:00",
 * //     Technicians: [{ name: "Jane" }, { name: "Anna" }],
 * //     Services: [
 * //       { name: "Manicure", count: 2 },
 * //       { name: "Pedicure", count: 1 }
 * //     ]
 * //   }
 * // ]
 */
    const groupAppointmentsByTime = (appointmentsList) => {
        const groupedMap = {};

        appointmentsList.forEach((appt) => {
            const key = `${appt.date}_${appt.start_service_time}`;

            if (!groupedMap[key]) {
                groupedMap[key] = { ...appt, Technicians: [], Services: [] };
            }

            groupedMap[key].Technicians.push(...appt.Technicians);
            groupedMap[key].Services.push(...appt.Services);
        });

        return Object.values(groupedMap).map((group) => {
            const serviceCounts = group.Services.reduce((acc, s) => {
                if (!acc[s.name]) {
                    acc[s.name] = { ...s, count: 0 };
                }
                acc[s.name].count++;
                return acc;
            }, {});

            return {
                ...group,
                Services: Object.values(serviceCounts),
            };
        });
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

            const techNames = apptsToCancel
                .flatMap(a => a.Technicians.map(t => t.name))
                .join(', ');
            appointment.Technicians = [{ name: techNames }];

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
                            {appointment.Services.map((s, idx) => (
                                <div key={idx}>
                                    {s.name}{s.count > 1 ? ` x ${s.count}` : ""}
                                </div>
                            ))}
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
