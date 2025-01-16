import React from "react";
import "./LeaveWarningModal.css"; // Ensure to import the updated CSS file

const LeaveWarningModal = ({ isOpen, onLeave, onCancel }) => {
  if (!isOpen) return null; // Do not render the modal if it's not open

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-header">Are you sure you want to leave the booking?</h2>
        <div className="modal-buttons">
          <button className="modal-button leave" onClick={onLeave}>
            Yes, Cancel Booking
          </button>
          <button className="modal-button cancel" onClick={onCancel}>
            No, Stay in Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveWarningModal;
