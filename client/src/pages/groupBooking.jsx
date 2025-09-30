import React, { useState, useEffect } from 'react';
import PhoneNumberVerification from '../components/booking_page/PhoneNumberVerification';
import GroupSizeSelection from '../components/group_booking_page/GroupSizeSelection'; // Import the new component
import AppointmentBookingLayout from '../components/group_booking_page/AppointmentBookingLayout';
import GroupAppointmentConfirmation from '../components/group_booking_page/GroupAppointmentConfirmation';

const GroupBooking = () => {
    const [step, setStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState(null);
    const [groupSize, setGroupSize] = useState(null); // Add state for group size
    const [createdAppointments, setCreatedAppointments] = useState([]);

    // Restore customer info from localStorage on the initial load
    useEffect(() => {
        const storedCustomerInfo = JSON.parse(localStorage.getItem('customerInfo'));
        if (storedCustomerInfo) {
            setCustomerInfo(storedCustomerInfo);
            // If customer is known, jump to step 2 (group size selection)
            setStep(2);
        }
    }, []);

    // Save customer info to localStorage whenever it changes
    useEffect(() => {
        if (customerInfo) {
            localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
        }
    }, [customerInfo]);

    const handleNextStep = () => setStep((prevStep) => prevStep + 1);
    const handlePrevStep = () => setStep((prevStep) => prevStep - 1);

    // New handler to receive group size from the new component
    const handleGroupSizeSubmit = (size) => {
        setGroupSize(size);
        handleNextStep(); // Move to the next step
    };

    return (
        <div
            className="min-h-screen bg-cover bg-center"
            style={{
                backgroundImage: "url('images/hero_white.jpg')",
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
            }}
        >
            {step === 1 && (
                <PhoneNumberVerification
                    onVerify={(customer) => {
                        setCustomerInfo(customer);
                        handleNextStep();
                    }}
                    className="transparent-bg"
                />
            )}

            {step === 2 && (
                <GroupSizeSelection
                    onNext={handleGroupSizeSubmit}
                />
            )}

            {step === 3 && (
                <AppointmentBookingLayout
                    customerInfo={customerInfo}
                    groupSize={groupSize}
                    onSubmitSuccess={(appointments) => {
                        setCreatedAppointments(appointments);
                        handleNextStep(); // go to step 4
                    }}
                />
            )}

            {step === 4 && (
                <GroupAppointmentConfirmation appointments={createdAppointments} />
            )}

            <div className="p-5"></div>
        </div>
    );
};

export default GroupBooking;