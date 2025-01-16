import React, { useState } from 'react';
import PhoneNumberVerification from '../components/booking_page/PhoneNumberVerification';
import ServiceSelection from '../components/booking_page/ServiceSelection';
import TechnicianSelection from '../components/booking_page/TechnicianSelection';
import AvailabilitySelection from '../components/booking_page/AvailabilitySelection';

const Booking = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [step, setStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState(null);

  const handleNextStep = () => setStep(step + 1);
  const handlePrevStep = () => setStep(step - 1);

  return (
    <div>
      {step === 1 && (
        <PhoneNumberVerification
          onVerify={(customer) => {
            setCustomerInfo(customer);
            handleNextStep();
          }}
        />
      )}

      {step === 2 && (
        <ServiceSelection
          customerInfo={customerInfo} // Pass customer info to service selection
          onSelectServices={setSelectedServices}
          onNext={handleNextStep}
          onBack={handlePrevStep}
        />
      )}

      {step === 3 && (
        <TechnicianSelection
          selectedServices={selectedServices}
          onSelectTechnicians={setSelectedTechnicians}
          onNext={handleNextStep}
          onBack={handlePrevStep}
        />
      )}

      {step === 4 && (
        <AvailabilitySelection
          selectedTechnicians={selectedTechnicians}
          onSelectAvailability={setAvailability}
          onBack={handlePrevStep}
          onConfirm={() => {
            console.log('Appointment confirmed:', {
              customerInfo,
              services: selectedServices,
              // addOns,
              technicians: selectedTechnicians,
              availability,
            });
          }}
        />
      )}

      <div className="p-5"></div>
    </div>
  );
};

export default Booking;
