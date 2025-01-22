import React, { useState, useEffect } from "react";
import AppointmentService from "../../services/appointmentService";

const AvailabilitySelection = ({
  customerInfo,
  selectedTechnicians,
  onSelectAvailability,
  onBack,
  onConfirm,
}) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const businessHours = { start: 9, end: 18 }; // 9 AM to 6 PM
  console.log(selectedTechnicians);
  
  useEffect(() => {
    if (selectedTechnicians > 0) {
      console.log("selected tech: " + selectedTechnicians);
      
      AppointmentService.findByTechId(selectedTechnicians)
        .then((response) => {
          console.log(response.data); // Log data to check the structure
          setAppointments(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching appointments:", error);
          setLoading(false);
        });
    }
  }, [selectedTechnicians]);

  useEffect(() => {
    if (appointments.length > 0) {
      calculateAvailableSlots();
    }
  }, [appointments]);

  const calculateAvailableSlots = () => {
    const occupiedSlots = [];

    // Iterate through each appointment to calculate occupied times
    appointments.forEach((appointment) => {
      const { date, start_service_time, services } = appointment;
      const startTime = new Date(`${date}T${start_service_time}`);
      const duration = services.reduce(
        (total, service) => total + service.duration,
        0
      ); // Sum up service durations
      const endTime = new Date(startTime.getTime() + duration * 60000); // Convert minutes to ms

      occupiedSlots.push({ startTime, endTime });
    });

    // Generate all slots during business hours and filter out occupied ones
    const slots = [];
    const currentDate = new Date();
    const startOfDay = new Date();
    startOfDay.setHours(businessHours.start, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(businessHours.end, 0, 0, 0);

    for (
      let slotStart = startOfDay;
      slotStart < endOfDay;
      slotStart = new Date(slotStart.getTime() + 30 * 60000) // Increment by 30 minutes
    ) {
      const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

      const isAvailable = !occupiedSlots.some(
        (occupied) =>
          (slotStart >= occupied.startTime && slotStart < occupied.endTime) ||
          (slotEnd > occupied.startTime && slotEnd <= occupied.endTime)
      );

      if (isAvailable) {
        slots.push(slotStart);
      }
    }

    setAvailableSlots(slots);
  };

  const handleSlotSelect = (slot) => {
    onSelectAvailability(slot);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="availability-selection">
      <h2>Select Availability</h2>
      {customerInfo?.name && (
        <p className="text-lg font-medium text-center mb-6">
          Welcome, {customerInfo.name}!
        </p>
      )}
      <div className="slots-container">
        {availableSlots.length > 0 ? (
          availableSlots.map((slot, index) => (
            <button
              key={index}
              className="slot"
              onClick={() => handleSlotSelect(slot)}
            >
              {slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </button>
          ))
        ) : (
          <p>No available slots for the selected technicians.</p>
        )}
      </div>
      <div className="actions">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <button className="confirm-button" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AvailabilitySelection;
