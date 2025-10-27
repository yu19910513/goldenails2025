import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import ApptManagement from '../components/admin_dashboard_page/appt_management_feature/ApptManagement';
import CustomerManagement from '../components/admin_dashboard_page/CustomerManagement';
import AppointmentBookingLayout from '../components/admin_dashboard_page/create_appt_feature/AppointmentBookingLayout';
import TabbedView from '../components/shared/TabbedView';
import Calendar from '../components/admin_dashboard_page/calendar_feature/calendar';


/**
 * Array of tab configurations for the admin dashboard.
 * Each tab includes a unique key, a display label, and the corresponding component to render.
 *
 * @constant
 * @type {Array<{ key: string, label: string, Component: React.ComponentType }>}
 */
const admin_tabs = [
    { key: 'Calendar', label: 'Appt Calendar', Component: Calendar },
    { key: 'NewAppt', label: 'Create Appt', Component: AppointmentBookingLayout },
    { key: 'CustMgt', label: 'Client Database', Component: CustomerManagement },
    { key: 'ApptMgt', label: 'Appt Database', Component: ApptManagement },
];

/**
 * Placeholder array for client dashboard tabs.
 * Currently empty but can be extended in the future for client-specific tabs.
 *
 * @constant
 * @type {Array}
 */
const client_tabs = [];

/**
 * Dashboard component that conditionally renders admin tabs based on JWT privileges.
 *
 * - Retrieves JWT from localStorage and decodes it.
 * - Checks for `admin_privilege` in the token's payload.
 * - If privilege is granted, renders admin dashboard with `TabbedView`.
 * - Otherwise, returns null (placeholder for future client dashboard content).
 * - On error (e.g., invalid token), logs error and renders nothing.
 *
 * @component
 * @returns {JSX.Element|null} Rendered dashboard UI or null if unauthorized or on error.
 */
const Dashboard = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    }
    try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT

        if (decodedToken?.data?.admin_privilege) {
            return (
                <div>
                    <TabbedView tabs={admin_tabs} />
                </div>
            );
        } else {
            return null; //customer dashboard page components
        }
    } catch (error) {
        console.error("Error parsing token or verifying privileges", error);
        return null; // nothing to render
    }
};

export default Dashboard;
