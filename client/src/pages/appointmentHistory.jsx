import React, { useState } from 'react';
import CustomerService from '../services/CustomerService';
import AppointmentService from '../services/AppointmentService';
import { sendCancellationNotification } from '../utils/helper';
import CustomerLoginForm from '../components/appointment_history_page/CustomerLoginForm';
import TabbedView from '../components/shared/TabbedView';
import AppointmentTabFactory from '../components/appointment_history_page/AppointmentTabFactory';
import './appointmentHistory.css';

/**
 * Page component to display a customer's appointment history.
 * Includes customer login by phone number and name, and displays
 * past, present, and future appointments in a tabbed view.
 * 
 * @component
 * @returns {JSX.Element} Appointment history page.
 */
const AppointmentHistory = () => {
    /** @type {[string, function]} Phone number input value and setter */
    const [phoneNumber, setPhoneNumber] = useState('');
    /** @type {[string, function]} Name input value and setter */
    const [enteredName, setEnteredName] = useState('');
    /** @type {[Object|null, function]} Customer information once validated */
    const [customerInfo, setCustomerInfo] = useState(null);
    /** @type {[Object, function]} Appointments categorized by past, present, future */
    const [appointments, setAppointments] = useState({ future: [], present: [], past: [] });
    /** @type {[boolean, function]} Loading state for form submission */
    const [loading, setLoading] = useState(false);
    /** @type {[string|null, function]} Error message */
    const [error, setError] = useState(null);

    /**
     * Handles form submission for customer login.
     * Validates customer using phone number and name, then fetches appointments.
     * 
     * @param {React.FormEvent<HTMLFormElement>} e - Form submission event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await CustomerService.validateUsingNumberAndName(
                phoneNumber,
                enteredName.trim().toUpperCase()
            );
            const customer = response.data;
            if (customer) {
                setCustomerInfo(customer);
                fetchAppointments(customer.id);
            } else setError('Customer not found');
        } catch (err) {
            setError('Error validating customer');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetches the customer's appointment history and updates state.
     * 
     * @param {number} customerId - ID of the customer.
     */
    const fetchAppointments = async (customerId) => {
        try {
            const response = await AppointmentService.customer_history(customerId);
            setAppointments(response.data);
        } catch (err) {
            setError('Error fetching appointments');
            console.error(err);
        }
    };

    /**
     * Determines CSS class for an appointment row based on its date.
     * 
     * @param {Object} appointment - Appointment object with a date field.
     * @returns {string} CSS class name: 'future-appointment', 'present-appointment', or 'past-appointment'.
     */
    const getAppointmentClass = (appointment) => {
        const appointmentDate = new Date(appointment.date + 'T00:00:00');
        const now = new Date();
        if (appointmentDate > now) return 'future-appointment';
        if (appointmentDate.toDateString() === now.toDateString()) return 'present-appointment';
        return 'past-appointment';
    };

    // Instantiate factory once customer info is available
    const tabFactory = customerInfo
        ? new AppointmentTabFactory(customerInfo, fetchAppointments, getAppointmentClass)
        : null;

    const appointmentTabs = tabFactory
        ? [
            tabFactory.createTab('present', "Today's", appointments.present),
            tabFactory.createTab('future', 'Future Appts.', appointments.future, true),
            tabFactory.createTab('past', 'Appt. History', appointments.past)
        ]
        : [];

    return (
        <div className="appointment-history">
            {!customerInfo ? (
                <CustomerLoginForm
                    phoneNumber={phoneNumber}
                    setPhoneNumber={setPhoneNumber}
                    enteredName={enteredName}
                    setEnteredName={setEnteredName}
                    handleSubmit={handleSubmit}
                    loading={loading}
                />
            ) : (
                <div>
                    <h3>Welcome back, {enteredName.toUpperCase()}!</h3>
                    <TabbedView tabs={appointmentTabs} />
                </div>
            )}

            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default AppointmentHistory;
