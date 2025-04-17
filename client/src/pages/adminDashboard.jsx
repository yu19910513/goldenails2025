import { React } from 'react';
import ApptManagement from '../components/admin_dashboard_page/ApptManagement';
import CustomerManagement from '../components/admin_dashboard_page/CustomerManagement';
import NewApptForm from '../components/admin_dashboard_page/NewApptForm';
import TabbedView from '../components/shared/TabbedView';
import Calendar from './calendar';

const tabs = [
    { key: 'NewAppt', label: 'New Appt Form', Component: NewApptForm },
    { key: 'CustMgt', label: 'Customer Management', Component: CustomerManagement },
    { key: 'ApptMgt', label: 'Appointment Management.', Component: ApptManagement }
];
// Main App Component
const AdminDashboard = () => (
    <div>
        <TabbedView tabs={tabs} />
    </div>
)
export default AdminDashboard