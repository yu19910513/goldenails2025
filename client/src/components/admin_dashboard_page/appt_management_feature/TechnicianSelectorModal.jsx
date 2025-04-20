import React from 'react';
import './TechnicianSelectorModal.css';

/**
 * @component TechnicianSelectorModal
 * @description A modal component that allows the user to select a technician from a list of available technicians. It handles form submission to confirm the selection and also provides the option to cancel the action.
 * 
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - A boolean flag to control if the modal is visible.
 * @param {Function} props.onClose - A function to close the modal when the user clicks the cancel button.
 * @param {Array} props.technicians - An array of technician objects that are available for selection.
 * @param {number} props.selectedTechId - The currently selected technician's ID.
 * @param {Function} props.onSelect - A function to handle the change of the selected technician.
 * @param {Function} props.onSubmit - A function to handle the form submission (confirm the technician selection).
 * 
 * @returns {JSX.Element|null} The modal JSX element if `isOpen` is true, otherwise `null`.
 */
const TechnicianSelectorModal = ({ isOpen, onClose, technicians, onSelect, selectedTechId, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>Select a Technician</h3>
                <form onSubmit={onSubmit}>
                    <div>
                        <label htmlFor="technician">{technicians.length} Technician(s) Available</label>
                        <select
                            id="technician"
                            value={selectedTechId || ""}
                            onChange={(e) => onSelect(e.target.value)}
                        >
                            <option value=""> --- </option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>
                                    {tech.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="submit">Confirm</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TechnicianSelectorModal;
