import React from "react";
import "./LeaveWarningModal.css"; // Ensure to import the updated CSS file

const LeaveWarningModal = ({ isOpen, onLeave, onCancel }) => {
  if (!isOpen) return null; // Do not render the modal if it's not open

  return (
    <div className="leave-warning-modal-overlay">
      <div className="leave-warning-modal-content">
        <h2 className="leave-warning-modal-header">
          Are you sure you want to leave the booking?
        </h2>
        <div className="leave-warning-modal-buttons">
          <button className="leave-warning-modal-button leave" onClick={onLeave}>
            Yes, Cancel Booking
          </button>
          <button className="leave-warning-modal-button cancel" onClick={onCancel}>
            No, Stay in Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveWarningModal;
