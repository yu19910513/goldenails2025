import React, { useState, useEffect } from "react";
import TechnicianService from "../../services/technicianService";

const TechnicianSelection = ({ selectedServices, onSelectTechnician, onNext, onBack }) => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      setLoading(true);
      try {
        const selectedServiceIds = Object.values(selectedServices).filter(Boolean);
        if (selectedServiceIds.length > 0) {
          const response = await TechnicianService.getAvailableTechnicians(selectedServiceIds);
          setTechnicians(response.data);
        } else {
          setTechnicians([]);
        }
      } catch (error) {
        console.error("Failed to fetch technicians:", error);
      } finally {
        setLoading(false);
      }
    };

    if (Object.values(selectedServices).some(Boolean)) {
      fetchTechnicians();
    }
  }, [selectedServices]);

  const handleSelectTechnician = (technicianId) => {
    setSelectedTechnician((prev) => (prev === technicianId ? null : technicianId));
  };

  return (
    <div className="relative">
      <h2 className="text-3xl font-bold mb-6 text-center p-4">Select Technician</h2>

      {loading ? (
        <div className="text-center py-6">Loading technicians...</div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-6">No technicians available for the selected services.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {technicians.map((technician) => (
            <div
              key={technician.id}
              className={`p-4 border rounded-lg cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg ${
                selectedTechnician === technician.id ? "bg-yellow-200" : "bg-white"
              }`}
              onClick={() => handleSelectTechnician(technician.id)}
            >
              <h4 className="text-lg font-bold">{technician.name}</h4>
              <p className="text-sm text-gray-600">Experience: {technician.experience} years</p>
              <p className="text-sm text-gray-600">Rating: {technician.rating} / 5</p>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-4 left-4">
        <button
          onClick={onBack}
          className="px-6 py-3 text-lg font-semibold rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
        >
          Go Back
        </button>
      </div>

      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => {
            onSelectTechnician(selectedTechnician);
            onNext();
          }}
          disabled={!selectedTechnician}
          className={`px-6 py-3 text-lg font-semibold rounded-lg transition-colors ${
            selectedTechnician
              ? "bg-yellow-500 text-black hover:bg-yellow-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TechnicianSelection;
