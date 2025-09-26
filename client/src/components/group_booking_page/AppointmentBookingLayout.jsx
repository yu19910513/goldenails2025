import React, { useState } from "react";
import NailSalonMenu from "./NailSalonMenu";
import NewApptForm from "./NewApptForm";
import "./AppointmentBookingLayout.css";

const AppointmentBookingLayout = ({ customerInfo, groupSize: initialGroupSize, onSubmitSuccess }) => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [groupSize, setGroupSize] = useState(initialGroupSize || 1);

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

  const handleGroupSizeChange = (newSize) => {
    setGroupSize(newSize);
    setSelectedServices((prev) =>
      prev.map((svc) => ({
        ...svc,
        quantity: Math.min(svc.quantity, newSize),
      }))
    );
  };

  return (
    <div className="appointment-booking-layout">

      {/* Bottom Handle for small screens */}
      <div
        className="appointment-booking-handle"
        onClick={() => setShowForm(!showForm)}
      >
        <span>{showForm ? "Close Form" : "Open Form"}</span>
      </div>

      {/* Menu Section */}
      <div className="appointment-booking-menu">
        <NailSalonMenu
          selectedServices={selectedServices}
          onServiceQuantityChange={handleServiceQuantityChange}
          groupSize={groupSize}
        />
      </div>

      {/* Form Section */}
      <div className={`appointment-booking-form ${showForm ? "show" : "hide"}`}>
        <NewApptForm
          selectedServices={selectedServices}
          customerInfo={customerInfo}
          groupSize={groupSize}
          onGroupSizeChange={handleGroupSizeChange}
          onSubmitSuccess={onSubmitSuccess}
        />
      </div>

    </div>
  );
};

export default AppointmentBookingLayout;
