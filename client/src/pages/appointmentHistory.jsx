import React, { useState } from 'react';
import CustomerService from '../services/customerService';
import AppointmentService from '../services/appointmentService';
import NotificationService from "../services/notificationService";
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


    /**
     * Sends an appointment cancellation notification via SMS and email.
     * 
     * This function extracts customer and appointment details, then triggers `NotificationService.notify()`.
     * If required data is missing, an error is logged and the function exits early.
     * 
     * @async
     * @function sendCancellationNotification
     * @param {Object} appointment - The appointment details.
     * @param {string} appointment.date - The appointment date.
     * @param {string} appointment.start_service_time - The start time of the appointment.
     * @param {Array} appointment.Technicians - List of technicians assigned to the appointment.
     * @throws {Error} Logs an error if notification fails.
     */
    const sendCancellationNotification = async (appointment) => {
        try {
            if (!appointment || !appointment.date || !appointment.start_service_time || !appointment.Technicians?.length) {
                console.error("Missing or invalid appointment details.");
                return;
            }

            if (!customerInfo?.name || !customerInfo?.phone) {
                console.error("Missing customer information.");
                return;
            }

            const { name, phone, email } = customerInfo;
            const technicianName = appointment.Technicians[0].name;

            const messageData = {
                recipient_name: name,
                recipient_phone: phone,
                recipient_email_address: email,
                recipient_email_subject: "Cancellation",
                recipient_optInSMS: true,
                action: "cancel",
                appointment_date: appointment.date,
                appointment_start_time: appointment.start_service_time,
                appointment_technician: technicianName,
                owner_email_subject: "Cancellation Request"
            };

            await NotificationService.notify(messageData);
            console.log("Cancellation SMS sent successfully");
        } catch (error) {
            console.error("Failed to send cancellation SMS:", error);
        }
    };


    // Handle appointment cancellation
    const handleCancel = async (appointment) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
        if (!confirmCancel) return;

        try {
            await AppointmentService.soft_delete(appointment.id);
            alert("Appointment successfully canceled.");
            sendCancellationNotification(appointment);
            fetchAppointments(customerInfo.id); // Refresh appointments after cancellation
        } catch (error) {
            alert("Failed to cancel appointment.");
            console.error(error);
        }
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
