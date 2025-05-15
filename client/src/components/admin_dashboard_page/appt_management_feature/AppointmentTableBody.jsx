import React, { useState, useEffect } from 'react';
import './AppointmentTableBody.css';
import AppointmentService from '../../../services/appointmentService';
import { sendCancellationNotification } from '../../../utils/helper';
import TechnicianSelectorModal from './TechnicianSelectorModal';



/**
 * @component AppointmentTableBody
 * @description A component that displays a list of appointments in a table format. It provides functionality to cancel appointments, modify assigned technicians, and interact with a modal to select alternative technicians.
 * 
 * @param {Object} props - The component props.
 * @param {Array} props.appointments - An array of appointment objects to be displayed in the table.
 * 
 * @returns {JSX.Element} The rendered table of appointments, including options for canceling or modifying technicians.
 */
const AppointmentTableBody = ({ appointments }) => {
  const [localAppointments, setLocalAppointments] = useState(appointments);
  const [modalOpen, setModalOpen] = useState(false);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  /**
   * @function handleCancel
   * @description Handles the process of canceling an appointment. It prompts the user to confirm the cancellation, sends a request to the server to cancel the appointment, sends a cancellation notification, and updates the local state to remove the canceled appointment.
   * 
   * @param {Object} appointment - The appointment object that is being canceled.
   * @param {number} appointment.id - The unique ID of the appointment to be canceled.
   * @param {Object} appointment.Customer - The customer associated with the appointment (optional).
   * @param {Array} appointment.Services - The list of services for the appointment (optional).
   * @param {Array} appointment.Technicians - The list of technicians assigned to the appointment (optional).
   * @returns {void} 
   * 
   * @throws {Error} If the cancellation fails or an error occurs during the process, an alert is shown, and the error is logged to the console.
   */
  const handleCancel = async (appointment) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;

    try {
      await AppointmentService.soft_delete(appointment.id);
      sendCancellationNotification(appointment);

      // Remove the appointment from local state
      setLocalAppointments(prev => prev.filter(appt => appt.id !== appointment.id));
    } catch (error) {
      alert("Failed to cancel appointment.");
      console.error(error);
    }
  };

  /**
   * @function handleModifyTechnician
   * @description Handles the process of fetching alternative technicians for a given appointment. It sends a request to the server to fetch available technicians and opens the technician selection modal.
   * 
   * @param {Object} appointment - The appointment object for which alternative technicians are being fetched.
   * @param {number} appointment.id - The unique ID of the appointment.
   * @param {Object} appointment.Customer - The customer associated with the appointment (optional).
   * @param {Array} appointment.Services - The list of services for the appointment (optional).
   * @param {Array} appointment.Technicians - The list of technicians assigned to the appointment (optional).
   * @returns {void} 
   * 
   * @throws {Error} If the request to fetch alternative technicians fails, the error is logged to the console.
   */
  const handleModifyTechnician = async (appointment) => {
    try {
      const response = await AppointmentService.find_alternative_techs(appointment.id);
      setAvailableTechs(response.data);
      setSelectedAppointment(appointment);
      setModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch alternative technicians", error);
    }
  };

  /**
   * @function handleTechConfirm
   * @description Handles the confirmation of a technician update for an appointment. It sends a request to the server to update the technician, updates the local state with the new technician, and resets the modal and selection state upon success.
   * 
   * @param {Event} e - The form submission event.
   * @returns {void} 
   * 
   * @throws {Error} If the technician update fails, the error is logged to the console.
   */
  const handleTechConfirm = async (e) => {
    e.preventDefault();

    // Return early if no technician is selected (optional, to avoid unnecessary API calls)
    if (!selectedTechId) {
      console.warn("No technician selected.");
      return;
    }

    try {
      // Destructure the response
      const { data } = await AppointmentService.update_technician(selectedAppointment.id, selectedTechId);
      const { message, updatedTechnician } = data;

      // Show alert or handle success UI here
      alert(message);

      // Update the local appointments state with the new technician
      setLocalAppointments(prevAppointments =>
        prevAppointments.map(appt =>
          appt.id === selectedAppointment.id
            ? { ...appt, Technicians: [updatedTechnician] }
            : appt
        )
      );

      // Reset modal and selections
      setModalOpen(false);
      setSelectedTechId(null);
      setSelectedAppointment(null);

    } catch (error) {
      console.error("Failed to update technician:", error);
      // Optionally, handle error message display here
    }
  };

  return (
    <tbody>
      {localAppointments.length > 0 ? (
        localAppointments.map((appt, index) => {
          const customer = appt.Customer || {};
          const services = appt.Services || [];
          const technicians = appt.Technicians || [];

          const serviceNames = services.map((s) => s.name).join(', ');
          const totalDuration = services.reduce((sum, s) => sum + (s.time || 0), 0);
          const estimatedTotalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0).toFixed(2);
          const technicianNames = technicians.map((t) => t.name).join(', ');

          const apptDateTime = new Date(`${appt.date}T${appt.start_service_time}`);
          const isPast = apptDateTime < new Date();
          const rowClass = `appointment-row ${isPast ? 'past-appointment' : 'future-appointment'}`;

          return (
            <tr key={appt.id || index} className={rowClass}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
              <td>{appt.date}</td>
              <td>{appt.start_service_time}</td>
              <td>{serviceNames}</td>
              <td>{totalDuration} mins</td>
              <td>{technicianNames}</td>
              <td>${estimatedTotalPrice}</td>
              <td>
                {/* Dropdown for selecting an action */}
                {!isPast && (
                  <select
                    onChange={(e) => {
                      if (e.target.value === 'cancel') {
                        handleCancel(appt);
                      } else if (e.target.value === 'modify') {
                        handleModifyTechnician(appt);
                      }
                      e.target.value = "";
                    }}
                    defaultValue=""
                    className="action-select"
                  >
                    <option value="">Select Action</option>
                    <option value="cancel">Cancel Appt.</option>
                    <option value="modify">Modify Technician</option>
                  </select>
                )}
                <TechnicianSelectorModal
                  isOpen={modalOpen}
                  onClose={() => { setModalOpen(false); setSelectedTechId(null); }}
                  technicians={availableTechs}
                  onSelect={setSelectedTechId}
                  selectedTechId={selectedTechId}
                  onSubmit={handleTechConfirm}
                />
                {/* Show button if action is selected */}
                {/* If action is "cancel" */}
                {isPast && (
                  <span className="no-action">No action available</span>
                )}
              </td>
            </tr>
          );
        })
      ) : (
        <tr>
          <td colSpan="10" className="no-appointments">No appointments found</td>
        </tr>
      )}
    </tbody>

  );
};

export default AppointmentTableBody;
