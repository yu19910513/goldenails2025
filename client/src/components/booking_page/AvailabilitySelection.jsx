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
  const [selectedDate, setSelectedDate] = useState(null); // Selected date for filtering
  const businessHours = { start: 9, end: 18 }; // 9 AM to 6 PM

  useEffect(() => {
    if (selectedTechnicians > 0) {
      AppointmentService.findByTechId(selectedTechnicians)
        .then((response) => {
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
    if (appointments.length > 0 && selectedDate) {
      calculateAvailableSlots();
    }
  }, [appointments, selectedDate]);

  const calculateAvailableSlots = () => {
    const occupiedSlots = [];
  
    if (appointments.length === 0) {
      console.log("No appointments found.");
    } else {
      const filteredAppointments = appointments.filter(
        (appointment) =>
          new Date(appointment.date).toISOString().split("T")[0] === selectedDate
      );
  
      filteredAppointments.forEach((appointment) => {
        const { start_service_time, services } = appointment;
        const duration = Array.isArray(services)
          ? services.reduce((total, service) => total + (service.time || 0), 0)
          : 0;
  
        const startTime = new Date(`${selectedDate}T${start_service_time}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        occupiedSlots.push({ startTime, endTime });
      });
    }
  
    console.log("Occupied Slots:", occupiedSlots);
  
    // Manually creating a valid Date for start of the day
    const [year, month, day] = selectedDate.split("-");
    const validDate = new Date(year, month - 1, day, businessHours.start, 0, 0);
  
    if (isNaN(validDate.getTime())) {
      console.log(selectedDate);
      console.log(businessHours);
      console.error("Invalid selectedDate format or value:", selectedDate);
      return;
    }
  
    const startOfDay = validDate;
    const endOfDay = new Date(year, month - 1, day, businessHours.end, 0, 0);
  
    console.log("Start of Day:", startOfDay);
    console.log("End of Day:", endOfDay);
  
    const slots = [];
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
  
    console.log("Generated Slots:", slots);
    setAvailableSlots(slots);
  };
  

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSlotSelect = (slot) => {
    onSelectAvailability(slot);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="availability-selection">
      <h2 className="text-center text-2xl font-bold mb-6">Select Availability</h2>
      {customerInfo?.name && (
        <p className="text-lg font-medium text-center mb-6">
          Welcome, {customerInfo.name}!
        </p>
      )}
      
      {/* Date Selection */}
      <div className="date-selection mb-4 text-center">
        <label htmlFor="date" className="text-lg font-medium mr-2">
          Select Date:
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate || ""}
          onChange={handleDateChange}
          className="border rounded p-2"
        />
      </div>

      {/* Time Slots */}
      <div className="slots-container text-center">
        {selectedDate ? (
          availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <button
                key={index}
                className="slot border rounded p-2 m-2 bg-blue-500 text-white hover:bg-blue-700"
                onClick={() => handleSlotSelect(slot)}
              >
                {slot.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </button>
            ))
          ) : (
            <p>No available slots for the selected date and technicians.</p>
          )
        ) : (
          <p>Please select a date to view available time slots.</p>
        )}
      </div>

      {/* Actions */}
      <div className="actions text-center mt-6">
        <button
          className="back-button bg-gray-500 text-white px-4 py-2 rounded mr-4 hover:bg-gray-700"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="confirm-button bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={onConfirm}
          disabled={!selectedDate || availableSlots.length === 0}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AvailabilitySelection;
