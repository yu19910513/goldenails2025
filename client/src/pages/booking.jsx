import React, { useState, useEffect } from 'react';
import PhoneNumberVerification from '../components/booking_page/PhoneNumberVerification';
import ServiceSelection from '../components/booking_page/ServiceSelection';
import TechnicianSelection from '../components/booking_page/TechnicianSelection';
import AvailabilitySelection from '../components/booking_page/AvailabilitySelection';
import AppointmentConfirmation from '../components/booking_page/AppointmentConfirmation';

const Booking = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState([]);
  const [slot, setSlot] = useState(null);
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [confirmedAppointment, setConfirmedAppointment] = useState(null);

  // Restore state from localStorage on mount
  useEffect(() => {
    const storedCustomerInfo = JSON.parse(localStorage.getItem('customerInfo'));
    if (storedCustomerInfo) {
      setCustomerInfo(storedCustomerInfo);
      setStep(2); // Jump to Step 2 if customerInfo exists
    }
  }, []);

  // Save state to localStorage whenever it updates
  useEffect(() => {
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
  }, [customerInfo]);

  const handleNextStep = () => setStep((prevStep) => prevStep + 1);
  const handlePrevStep = () => setStep((prevStep) => prevStep - 1);

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
        <ServiceSelection
          customerInfo={customerInfo}
          onSelectServices={setSelectedServices}
          onNext={handleNextStep}
          onBack={handlePrevStep}
        />
      )}

      {step === 3 && (
        <TechnicianSelection
          customerInfo={customerInfo}
          selectedServices={selectedServices}
          onSelectTechnician={setSelectedTechnician}
          onNext={handleNextStep}
          onBack={handlePrevStep}
        />
      )}

      {step === 4 && (
        <AvailabilitySelection
          customerInfo={customerInfo}
          selectedServices={selectedServices}
          selectedTechnician={selectedTechnician}
          onSelectSlot={setSlot}
          onBack={handlePrevStep}
          onConfirm={() => {
            const appointmentDetails = {
              customerInfo,
              services: selectedServices,
              technician: selectedTechnician,
              slot,
            };
            setConfirmedAppointment(appointmentDetails);
            handleNextStep();
          }}
        />
      )}

      {step === 5 && confirmedAppointment && (
        <AppointmentConfirmation
          appointmentDetails={confirmedAppointment}
        />
      )}

      <div className="p-5"></div>
    </div>
  );
};

export default Booking;
