import React, { useState } from 'react';
import ServiceSelection from '../components/booking_page/ServiceSelection';
import AddOnSelection from '../components/booking_page/AddOnSelection';
import TechnicianSelection from '../components/booking_page/TechnicianSelection';
import AvailabilitySelection from '../components/booking_page/AvailabilitySelection';

const Booking = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [addOns, setAddOns] = useState({});
  const [selectedTechnicians, setSelectedTechnicians] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [step, setStep] = useState(1);

  const handleNextStep = () => setStep(step + 1);
  const handlePrevStep = () => setStep(step - 1);

  return (
    <div>
      {step === 1 && (
        <ServiceSelection
          onSelectServices={setSelectedServices}
          onNext={handleNextStep}
        />
      )}
      {step === 2 && (
        <AddOnSelection
          selectedServices={selectedServices}
          onSelectAddOns={setAddOns}
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
              services: selectedServices,
              addOns,
              technicians: selectedTechnicians,
              availability,
            });
          }}
        />
      )}
    </div>
  );
};

export default Booking;
