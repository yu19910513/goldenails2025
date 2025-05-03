import React, { useState } from "react";
import NailSalonMenu from "./NailSalonMenu";
import NewApptForm from "./NewApptForm";
import "./AppointmentBookingLayout.css";

const AppointmentBookingLayout = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const handleServiceSelect = (service) => {
    setSelectedServices((prev) => {
      if (prev.some((s) => s.id === service.id)) return prev;
      return [...prev, service];
    });
  };

  const handleRemoveService = (serviceId) => {
    setSelectedServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  return (
    <div className="booking-layout">
      {/* Menu Section */}
      <div className="menu-section">
        <NailSalonMenu
          selectedServices={selectedServices}
          onServiceSelect={handleServiceSelect}
          onRemoveService={handleRemoveService}
        />
      </div>

      {/* Form Section */}
      <div
        className={`form-section ${showForm ? "show" : "hide"}`}
      >
        <NewApptForm
          selectedServices={selectedServices}
        />
      </div>
    
      {/* Toggle Button */}
      <button
        className="toggle-form-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "📋" : "✏️"}
      </button>
    </div>
  );
};

export default AppointmentBookingLayout;