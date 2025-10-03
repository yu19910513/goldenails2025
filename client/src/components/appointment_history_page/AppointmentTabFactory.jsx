// AppointmentTabFactory.js
import React from 'react';
import AppointmentTable from './AppointmentTable';

/**
 * Factory class for creating tab configurations with appointment tables
 * to be used in a TabbedView component.
 */
class AppointmentTabFactory {
    /**
     * Creates an instance of AppointmentTabFactory.
     * 
     * @param {object} customerInfo - Information about the customer.
     * @param {function} fetchAppointments - Function to fetch appointments for the customer.
     * @param {function} getAppointmentClass - Function to determine the class/style of each appointment.
     */
    constructor(customerInfo, fetchAppointments, getAppointmentClass) {
        this.customerInfo = customerInfo;
        this.fetchAppointments = fetchAppointments;
        this.getAppointmentClass = getAppointmentClass;
    }

    /**
     * Creates a tab configuration object for a TabbedView component.
     * 
     * @param {string} key - Unique key for the tab.
     * @param {string} label - Display label for the tab.
     * @param {Array<object>} appointmentList - Array of appointment objects for this tab.
     * @param {boolean} [showCancel=false] - Whether the cancel button should be displayed.
     * @returns {object} Tab configuration object with a React component to render the appointment table.
     */
    createTab(key, label, appointmentList, showCancel = false) {
        return {
            key,
            label,
            Component: () => (
                <AppointmentTable
                    appointmentsList={appointmentList}
                    customerInfo={this.customerInfo}
                    fetchAppointments={this.fetchAppointments}
                    getAppointmentClass={this.getAppointmentClass}
                    showCancel={showCancel}
                />
            )
        };
    }
}

export default AppointmentTabFactory;
