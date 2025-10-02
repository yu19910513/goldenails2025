// AppointmentTabFactory.js
import React from 'react';
import AppointmentTable from './AppointmentTable';

export default class AppointmentTabFactory {
    constructor(customerInfo, fetchAppointments, getAppointmentClass) {
        this.customerInfo = customerInfo;
        this.fetchAppointments = fetchAppointments;
        this.getAppointmentClass = getAppointmentClass;
    }

    /**
     * Creates a tab object for TabbedView
     * @param {string} key - Unique tab key
     * @param {string} label - Tab label
     * @param {Array} appointmentList - List of appointments for this tab
     * @param {boolean} showCancel - Whether cancel button should show
     * @returns {object} Tab configuration object
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
