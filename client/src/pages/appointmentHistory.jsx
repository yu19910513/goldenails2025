import React, { useState } from 'react';
import CustomerService from '../services/customerService';
import AppointmentService from '../services/appointmentService';
import MiscellaneousService from '../services/miscellaneousService';
import './appointmentHistory.css';

const AppointmentHistory = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [enteredName, setEnteredName] = useState('');
    const [customerInfo, setCustomerInfo] = useState(null);
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

    // Fetch customer appointments after validation
    const fetchAppointments = async (customerId) => {
        try {
            const response = await AppointmentService.customer_history(customerId);
            setAppointments(response.data);
        } catch (error) {
            setError('Error fetching appointments');
            console.error(error);
        }
    };

    const messageEngine = (appointment) => {
        const messageData = {
            customer_number: customerInfo.phone,
            customer_message: `Dear ${customerInfo.name}, We would like to inform you that your appointment at Golden Nails Gig Harbor, scheduled for ${appointment.date}, at ${appointment.start_service_time}, has been successfully cancelled. If you have any further questions or would like to reschedule, please feel free to contact us at (253) 851-7563.`,
            owner_message: `Appointment cancelled by ${customerInfo.name} (${customerInfo.phone}), scheduled for ${appointment.date}, at ${appointment.start_service_time}. Technician: ${appointment.Technicians[0].name}. `,
        };
        MiscellaneousService.notifyCustomer(messageData)
            .then(() => console.log("SMS sent successfully"))
            .catch((error) => console.error("Failed to send SMS:", error));
    }

    // Handle appointment cancellation
    const handleCancel = async (appointment) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
        if (!confirmCancel) return;

        try {
            await AppointmentService.soft_delete(appointment.id);
            alert("Appointment successfully canceled.");
            messageEngine(appointment);
            fetchAppointments(customerInfo.id); // Refresh appointments after cancellation
        } catch (error) {
            alert("Failed to cancel appointment.");
            console.error(error);
        }
        messageEngine(appointment);
    };

    // Switch tabs
    const handleTabChange = (tabName) => {
        setTab(tabName);
    };

    // Render the appointments table based on selected tab
    const renderAppointments = (appointmentsList, showCancel = false) => {
        return appointmentsList.length === 0 ? (
            <p>No appointments found.</p>
        ) : (
            <table className="appointment-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Technician</th>
                        <th>Services</th>
                        {showCancel && <th>Action</th>}
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
                            {showCancel && (
                                <td>
                                    <button className="cancel-btn" onClick={() => handleCancel(appointment)}>
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

    // Get the class for each row based on appointment status
    const getAppointmentClass = (appointment) => {
        const appointmentDate = new Date(appointment.date + 'T00:00:00');
        const now = new Date();
        if (appointmentDate > now) return 'future-appointment';
        if (appointmentDate.toDateString() === now.toDateString()) return 'present-appointment';
        return 'past-appointment';
    };

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
                        <button className={tab === 'present' ? 'active' : ''} onClick={() => handleTabChange('present')}>
                            Today's
                        </button>
                        <button className={tab === 'future' ? 'active' : ''} onClick={() => handleTabChange('future')}>
                            Future Appts.
                        </button>
                        <button className={tab === 'past' ? 'active' : ''} onClick={() => handleTabChange('past')}>
                            Appt. History
                        </button>
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
