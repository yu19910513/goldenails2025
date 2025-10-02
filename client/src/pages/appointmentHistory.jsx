import React, { useState } from 'react';
import CustomerService from '../services/customerService';
import AppointmentService from '../services/appointmentService';
import { sendCancellationNotification } from '../utils/helper';
import './appointmentHistory.css';

const AppointmentHistory = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [enteredName, setEnteredName] = useState('');
    const [customerInfo, setCustomerInfo] = useState(null);
    const [appointments, setAppointments] = useState({ future: [], present: [], past: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('present');

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await CustomerService.validateUsingNumberAndName(phoneNumber, enteredName.trim().toUpperCase());
            const customer = response.data;
            if (customer) {
                setCustomerInfo(customer);
                fetchAppointments(customer.id);
            } else {
                setError('Customer not found');
            }
        } catch (error) {
            setError('Error validating customer');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch appointments
    const fetchAppointments = async (customerId) => {
        try {
            const response = await AppointmentService.customer_history(customerId);
            setAppointments(response.data);
        } catch (error) {
            setError('Error fetching appointments');
            console.error(error);
        }
    };

    // Group appointments by date + time
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

        return Object.values(groupedMap);
    };

    // Render appointments
    const renderAppointments = (appointmentsList, showCancel = false) => {
        if (appointmentsList.length === 0) return <p>No appointments found.</p>;

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
                                {appointment.Technicians.map((t) => t.name).join(', ')}
                                {appointment.Technicians.length > 1 && (
                                    <div className="group-label">
                                        (Group booking with {appointment.Technicians.length} technicians)
                                    </div>
                                )}
                            </td>
                            <td>
                                {(() => {
                                    const serviceCount = {};
                                    appointment.Services.forEach((s) => {
                                        serviceCount[s.name] = (serviceCount[s.name] || 0) + 1;
                                    });
                                    return Object.entries(serviceCount).map(([name, count], idx) => (
                                        <div key={idx}>
                                            {name}{count > 1 ? ` x${count}` : ''}
                                        </div>
                                    ));
                                })()}
                            </td>
                            {showCancel && (
                                <td>
                                    <button
                                        className="cancel-btn"
                                        onClick={async () => {
                                            const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
                                            if (!confirmCancel) return;

                                            try {
                                                // Cancel all appointments in the group
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
                                        }}
                                    >
                                        Cancel Appt.
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // Get class for row
    const getAppointmentClass = (appointment) => {
        const appointmentDate = new Date(appointment.date + 'T00:00:00');
        const now = new Date();
        if (appointmentDate > now) return 'future-appointment';
        if (appointmentDate.toDateString() === now.toDateString()) return 'present-appointment';
        return 'past-appointment';
    };

    // Switch tabs
    const handleTabChange = (tabName) => setTab(tabName);

    return (
        <div className="appointment-history">
            {!customerInfo ? (
                <form onSubmit={handleSubmit}>
                    <p className="instruction">
                        Please enter the phone number and name used when scheduling your appointment to access your appointment history.
                    </p>
                    <div>
                        <label>Phone Number:</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            required
                            pattern="[0-9]*"
                        />
                    </div>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={enteredName}
                            onChange={(e) => setEnteredName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Enter'}
                    </button>
                    <p className="note">
                        For assistance with accessing your appointment history, please contact our Gig Harbor location at (253) 851-7563.
                    </p>
                </form>
            ) : (
                <div>
                    <h3>Welcome back, {enteredName.toUpperCase()}!</h3>
                    <div className="tabs">
                        <button className={tab === 'present' ? 'active' : ''} onClick={() => handleTabChange('present')}>Today's</button>
                        <button className={tab === 'future' ? 'active' : ''} onClick={() => handleTabChange('future')}>Future Appts.</button>
                        <button className={tab === 'past' ? 'active' : ''} onClick={() => handleTabChange('past')}>Appt. History</button>
                    </div>
                    <div>
                        {tab === 'present' && renderAppointments(appointments.present)}
                        {tab === 'future' && renderAppointments(appointments.future, true)}
                        {tab === 'past' && renderAppointments(appointments.past)}
                    </div>
                </div>
            )}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default AppointmentHistory;
