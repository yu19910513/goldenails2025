import React from 'react';

/**
 * Form component for customers to log in and access their appointment history.
 * Requires phone number and name that were used when scheduling the appointment.
 * 
 * @param {Object} props - Component props.
 * @param {string} props.phoneNumber - Current phone number input value.
 * @param {function} props.setPhoneNumber - Function to update the phone number state.
 * @param {string} props.enteredName - Current name input value.
 * @param {function} props.setEnteredName - Function to update the name state.
 * @param {function} props.handleSubmit - Function to handle form submission.
 * @param {boolean} props.loading - Indicates whether form submission is in progress.
 * @returns {JSX.Element} Rendered customer login form.
 */
const CustomerLoginForm = ({ phoneNumber, setPhoneNumber, enteredName, setEnteredName, handleSubmit, loading }) => (
    <form onSubmit={handleSubmit}>
        <p className="instruction">
            Please enter the phone number and name used when scheduling your appointment to access your appointment history.
        </p>
        <div>
            <label>Phone Number:</label>
            <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                required
                pattern="[0-9]*"
            />
        </div>
        <div>
            <label>Name:</label>
            <input
                type="text"
                value={enteredName}
                onChange={(e) => setEnteredName(e.target.value)}
                required
            />
        </div>
        <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Enter'}
        </button>
        <p className="note">
            For assistance with accessing your appointment history, please contact our Gig Harbor location at (253) 851-7563.
        </p>
    </form>
);

export default CustomerLoginForm;
