import React, { useState } from "react";
import NailSalonMenu from "./NailSalonMenu";
import NewApptForm from "./NewApptForm";
import "./AppointmentBookingLayout.css";

const AppointmentBookingLayout = ({ customerInfo, groupSize }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Update quantity of a service
  const handleServiceQuantityChange = (service, quantity) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (quantity === 0) {
        return prev.filter((s) => s.id !== service.id);
      } else if (exists) {
        return prev.map((s) =>
          s.id === service.id ? { ...s, quantity } : s
        );
      } else {
        return [...prev, { ...service, quantity }];
      }
    });
  };

  return (
    <div className="booking-layout">
      {/* Menu Section */}
      <div className="menu-section">
        <NailSalonMenu
          selectedServices={selectedServices}
          onServiceQuantityChange={handleServiceQuantityChange}
          groupSize={groupSize}
        />
      </div>

      {/* Form Section */}
      <div className={`form-section ${showForm ? "show" : "hide"}`}>
        <NewApptForm
          selectedServices={selectedServices}
          customerInfo={customerInfo}
          groupSize={groupSize}
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
