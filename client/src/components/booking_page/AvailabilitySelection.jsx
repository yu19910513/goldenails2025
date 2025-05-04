import React, { useState, useEffect } from "react";
import AppointmentService from "../../services/appointmentService";
import { calculateTotalAmount, calculateTotalTime, calculateAvailableSlots, waTimeString } from "../../common/utils";
import MiscellaneousService from "../../services/miscellaneousService";

const AvailabilitySelection = ({
  customerInfo,
  selectedServices,
  selectedTechnician,
  onSelectSlot,
  onBack,
  onConfirm,
  reloadComponent
}) => {
  const [existingAppointments, setExistingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const businessHours = { start: 9, end: 19 }; // 9 AM to 7 PM
  const [selectedSlot, setSelectedSlot] = useState(null); // Store selected time slot for appointment
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null); // Index of selected slot for styling


  useEffect(() => {
    if (localStorage.getItem("selectedDate") != null) {
      setSelectedDate(localStorage.getItem("selectedDate"));
    }

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
    const fetchSlots = async () => {
      if (!selectedDate) return;
      let bufferTimeHours = 0;
      const today = new Date();
      const selected = new Date(`${selectedDate}T00:00:00`);

      const isToday =
        today.getFullYear() === selected.getFullYear() &&
        today.getMonth() === selected.getMonth() &&
        today.getDate() === selected.getDate();

      const isSunday = selected.getDay() === 0;
      const adjustedBusinessHours = isSunday
        ? { start: 11, end: 17 }
        : businessHours;

      if (isToday) {
        try {
          const response = await MiscellaneousService.find("bufferTime");
          const raw = Number(response?.data?.context);
          bufferTimeHours = raw > 0 ? Math.ceil(raw) : 0;
        } catch (e) {
          console.warn("Failed to fetch bufferTime. Defaulting to 0.");
        }
      }

      const slots = calculateAvailableSlots(
        existingAppointments,
        selectedServices,
        selectedDate,
        adjustedBusinessHours,
        selectedTechnician,
        bufferTimeHours
      );

      setAvailableSlots(slots);
    };

    fetchSlots();
  }, [existingAppointments, selectedDate]);


  const handleDateChange = (event) => {
    localStorage.setItem("selectedDate", event.target.value);
    setSelectedDate(event.target.value);
    setSelectedSlot(null);
    setSelectedSlotIndex(null);
    onSelectSlot(null);
  };

  const handleSlotSelect = (slot, index) => {
    if (selectedSlotIndex === index) {
      // Deselect the slot
      setSelectedSlot(null);
      setSelectedSlotIndex(null);
      onSelectSlot(null);
    } else {
      // Select the slot
      setSelectedSlot(slot);
      setSelectedSlotIndex(index);
      onSelectSlot(slot);
    }
  };

  const handleConfirm = () => {
    if (!selectedSlot || !selectedDate || !selectedTechnician) return;

    const appointmentData = {
      customer_id: customerInfo.id,
      date: selectedDate,
      start_service_time: waTimeString(selectedSlot),
      technician_id: [selectedTechnician.id],
      service_ids: Object.values(selectedServices).flatMap(category =>
        category.map(service => service.id)),
    };
    AppointmentService.create(appointmentData)
      .then((response) => {
        console.log("Appointment created:", response.data);
        onConfirm(response.data);
        // localStorage.clear();
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          const { message, conflictingSlot } = error.response.data;
          alert(`${message} Conflicting time: ${conflictingSlot}`);
          reloadComponent();
        } else {
          console.error("Error creating appointment:", error);
        }
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="availability-selection max-w-[1000px] mx-auto p-4">
      <h2 className="text-center text-2xl font-bold mb-6">
        Select {selectedTechnician.name.includes(' ') ? '' : `${selectedTechnician.name}'s`} Availability
      </h2>
      {customerInfo?.name && (
        <p className="text-lg font-medium text-center mb-6">
          Welcome, {customerInfo.name}!
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:space-x-8 sm:space-y-0 space-y-8">
        {selectedTechnician && (
          <div className="bg-white p-6 border rounded-lg shadow-lg sm:w-1/2 w-full max-h-[500px]">
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
              min={new Date().toLocaleDateString('en-CA')} // Restrict past dates
            />
          </div>

          <div className="slots-container text-center">
            {selectedDate ? (
              availableSlots.length > 0 ? (
                availableSlots.map((slot, index) => (
                  <button
                    key={index}
                    className={`slot border rounded p-2 m-2 max-w-[100px] ${selectedSlotIndex === index ? "bg-gray-500 hover:bg-gray-700" : "bg-blue-500 hover:bg-blue-700"} text-white`}
                    onClick={() => handleSlotSelect(slot, index)}
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

      <div className="fixed bottom-4 left-4">
        <button
          onClick={onBack}
          className="px-6 py-3 text-lg font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-700"
        >
          Back
        </button>
      </div>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={handleConfirm}
          disabled={!selectedSlot || !selectedDate || !selectedTechnician}
          className={`px-6 py-3 text-lg font-semibold rounded-full transition-colors ${selectedSlot && selectedDate && selectedTechnician
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
