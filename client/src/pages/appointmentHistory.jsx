import React, { useState } from 'react';
import CustomerService from '../services/customerService';
import AppointmentService from '../services/appointmentService';
import './appointmentHistory.css';

const AppointmentHistory = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [enteredName, setEnteredName] = useState('');
    const [customerId, setCustomerId] = useState(null);
    const [appointments, setAppointments] = useState({ future: [], present: [], past: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('present'); // Default tab is 'now'


    // Handle form submission for phone and name
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await CustomerService.validateUsingNumberAndName(phoneNumber, enteredName.trim().toUpperCase());
            const customer = response.data;
            console.log(response.data);

            if (customer) {
                setCustomerId(customer.id);
                fetchAppointments(customer.id); // If customer found, fetch appointments
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

    // Fetch customer appointments after validation
    const fetchAppointments = async (customerId) => {
        try {
            const response = await AppointmentService.customer_history(customerId);
            console.log(response.data);
            const allAppointments = response.data;
            setAppointments(allAppointments);
        } catch (error) {
            setError('Error fetching appointments');
            console.error(error);
        }
    };

    // Switch tabs
    const handleTabChange = (tabName) => {
        setTab(tabName);
    };

    // Render the appointments table based on selected tab
    const renderAppointments = (appointmentsList) => {
        return appointmentsList.length === 0 ? (
            <p>No appointments found.</p>
        ) : (
            <table className="appointment-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Technician</th>
                        <th>Services</th>
                    </tr>
                </thead>
                <tbody>
                    {appointmentsList.map((appointment, index) => (
                        <tr key={index} className={getAppointmentClass(appointment)}>
                            <td>{appointment.date}, {appointment.start_service_time}</td>
                            <td>{appointment.Technicians[0].name}</td>
                            <td>
                                {appointment.Services.map((service, idx) => (
                                    <div key={idx}>{service.name}</div>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    // Get the class for each row based on appointment status
    const getAppointmentClass = (appointment) => {
        const appointmentDate = new Date(appointment.date+'T00:00:00');
        const now = new Date();
        if (appointmentDate > now) return 'future-appointment';
        if (appointmentDate.toDateString() === now.toDateString()) return 'present-appointment';
        return 'past-appointment';
    };

    return (
        <div className="appointment-history">
            {/* Form for phone number and name */}
            {!customerId ? (
                <form onSubmit={handleSubmit}>
                    <p className="instruction">
                        Please enter the phone number and name used when scheduling your appointment to access your appointment history.
                    </p>
                    <div>
                        <label>Phone Number:</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => {
                                // Only allow numeric input (0-9)
                                const value = e.target.value.replace(/\D/g, '');
                                setPhoneNumber(value);
                            }}
                            required
                            pattern="[0-9]*" // Optional: Helps on mobile devices to bring up the numeric keypad
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
                        <button
                            className={tab === 'present' ? 'active' : ''}
                            onClick={() => handleTabChange('present')}
                        >
                            Today's
                        </button>
                        <button
                            className={tab === 'future' ? 'active' : ''}
                            onClick={() => handleTabChange('future')}
                        >
                            Future Appts.
                        </button>
                        <button
                            className={tab === 'past' ? 'active' : ''}
                            onClick={() => handleTabChange('past')}
                        >
                            Appt. History
                        </button>          </div>
                    <div>
                        {tab === 'present' && renderAppointments(appointments.present)}
                        {tab === 'future' && renderAppointments(appointments.future)}
                        {tab === 'past' && renderAppointments(appointments.past)}
                    </div>
                </div>
            )}

            {/* Display errors */}
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default AppointmentHistory;
