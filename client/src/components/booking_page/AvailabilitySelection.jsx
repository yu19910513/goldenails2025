import React, { useState, useEffect } from "react";
import AppointmentService from "../../services/appointmentService"; // Make sure this service includes the 'create' method
import { calculateTotalAmount, calculateTotalTime, calculateAvailableSlots } from "../../common/utils";

const AvailabilitySelection = ({
  customerInfo,
  selectedServices,
  selectedTechnician,
  onSelectAvailability,
  onBack,
  onConfirm,
}) => {
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // Selected date for filtering
  const businessHours = { start: 9, end: 18 }; // 9 AM to 6 PM
  const [selectedSlot, setSelectedSlot] = useState(null); // Store selected slot for appointment

  useEffect(() => {
    if (selectedTechnician != null) {
      AppointmentService.findByTechId(selectedTechnician.id)
        .then((response) => {
          setExistingAppointments(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching appointments:", error);
          setLoading(false);
        });
    }
  }, [selectedTechnician]);

  useEffect(() => {
    if (selectedDate) {
      setAvailableSlots(calculateAvailableSlots(existingAppointments, selectedServices, selectedDate, businessHours));
    }
  }, [existingAppointments, selectedDate]);

  

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot); // Store selected time slot
    onSelectAvailability(slot);
  };

  const handleConfirm = () => {
    if (!selectedSlot || !selectedDate || !selectedTechnician) return;

    const appointmentData = {
      customer_id: customerInfo.id, // Assuming the customer has an ID
      date: selectedDate,
      start_service_time: selectedSlot.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      technician_id: [selectedTechnician.id], // Assuming technician has an ID
      service_ids: Object.values(selectedServices).flatMap(category =>
        category.map(service => service.id)), // Attach selected services
    };
    AppointmentService.create(appointmentData)
      .then((response) => {
        // Handle successful appointment creation
        console.log("Appointment created:", response.data);
        onConfirm(response.data); // Call onConfirm with created appointment data
      })
      .catch((error) => {
        console.error("Error creating appointment:", error);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="availability-selection max-w-[1000px] mx-auto p-4">
      <h2 className="text-center text-2xl font-bold mb-6">Select Availability</h2>
      {customerInfo?.name && (
        <p className="text-lg font-medium text-center mb-6">
          Welcome, {customerInfo.name}!
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:space-x-8 sm:space-y-0 space-y-8">
        {/* Card for selected services and technician */}
        {selectedTechnician && (
          <div className="bg-white p-6 border rounded-lg shadow-lg sm:w-1/2 w-full">
            <h3 className="text-xl font-bold mb-4">Your Selection</h3>

            <div className="mb-2">
              <strong>Technician:</strong> {selectedTechnician.name}
            </div>

            <div className="mb-2">
              <strong>Selected Services:</strong>
              <ul className="list-inside">
                {Object.keys(selectedServices).map((categoryId) =>
                  selectedServices[categoryId].map((service) => (
                    <li key={service.id}>{service.name}</li>
                  ))
                )}
              </ul>
            </div>

            <div className="mb-2">
              <strong>Total Duration:</strong> {calculateTotalTime(selectedServices)} minutes
            </div>

            <div className="mb-2">
              <strong>Total Price:</strong> ${calculateTotalAmount(selectedServices)}
            </div>
          </div>
        )}

        {/* Date and Time Slot Selection */}
        <div className="sm:w-1/2 w-full">
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
              min={new Date().toISOString().split("T")[0]} // Restrict past dates
            />
          </div>

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
                <p>No available slots for the selected date and technician.</p>
              )
            ) : (
              <p>Please select a date to view available time slots.</p>
            )}
          </div>
        </div>
      </div>

      {/* Floating Back and Confirm Buttons */}
      <div className="fixed bottom-4 left-4">
        <button
          onClick={onBack}
          className="px-6 py-3 text-lg font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600"
        >
          Back
        </button>
      </div>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleConfirm}
          disabled={!selectedSlot || !selectedDate || !selectedTechnician}
          className={`px-6 py-3 text-lg font-semibold rounded-lg transition-colors ${selectedSlot && selectedDate && selectedTechnician
            ? "bg-yellow-500 text-black hover:bg-yellow-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AvailabilitySelection;
