import React, { useState, useEffect } from 'react';
import AppointmentTableBody from './AppointmentTableBody';
import AppointmentService from '../../../services/appointmentService';
import './ApptManagement.css';  // Import a CSS file for styling

/**
 * @component ApptManagement
 * @description A component that manages appointments, including searching for appointments by customer information and displaying them in a table. It fetches appointments from the server based on a search keyword and passes the data to the `AppointmentTableBody` component for display.
 * 
 * @returns {JSX.Element} The rendered component with a search input field and a table displaying the filtered list of appointments.
 */
const ApptManagement = () => {
  const [searchKeyword, setSearchKeyword] = useState('*');
  const [appointments, setAppointments] = useState([]);

  // Fetch filtered appointments from the server based on the keyword
  useEffect(() => {
    const fetchAppointments = async (searchKeyword) => {
      try {
        const response = await AppointmentService.search(searchKeyword);
        // Check if the response is successful (status 200)
        if (!response.data) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setAppointments(response.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    // Fetch only if there is a search keyword or on initial load
    if (searchKeyword) {
      fetchAppointments(searchKeyword);
    }
  }, [searchKeyword]);

  return (
    <div className="appt-management">
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value.trim())}
        placeholder="Search by customer name, phone, or email"
        className="search-input"
      />
      <div className="table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Customer Phone</th>
              <th>Appointment Date</th>
              <th>Appointment Start Time</th>
              <th>Services</th>
              <th>Total Appointment Duration</th>
              <th>Assigned Technician</th>
              <th>Estimated Total Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <AppointmentTableBody appointments={appointments} />
        </table>
      </div>
    </div>
  );
};

export default ApptManagement;
