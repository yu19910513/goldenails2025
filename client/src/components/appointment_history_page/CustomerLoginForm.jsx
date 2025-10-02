import React from 'react';

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
