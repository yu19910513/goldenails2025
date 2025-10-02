import React, { useState } from 'react';
import CustomerService from '../services/CustomerService';
import AppointmentService from '../services/AppointmentService';
import { sendCancellationNotification } from '../utils/helper';
import CustomerLoginForm from '../components/appointment_history_page/CustomerLoginForm';
import TabbedView from '../components/shared/TabbedView';
import AppointmentTabFactory from '../components/appointment_history_page/AppointmentTabFactory';
import './appointmentHistory.css';

const AppointmentHistory = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [enteredName, setEnteredName] = useState('');
    const [customerInfo, setCustomerInfo] = useState(null);
    const [appointments, setAppointments] = useState({ future: [], present: [], past: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    const fetchAppointments = async (customerId) => {
        try {
            const response = await AppointmentService.customer_history(customerId);
            setAppointments(response.data);
        } catch (err) {
            setError('Error fetching appointments');
            console.error(err);
        }
    };

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
