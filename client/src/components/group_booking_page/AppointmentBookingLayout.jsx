import React, { useState } from "react";
import NailSalonMenu from "./NailSalonMenu";
import NewApptForm from "./NewApptForm";
import "./GroupBooking.css";

/**
 * AppointmentBookingLayout component
 *
 * Provides a layout for booking group nail salon appointments.
 * It renders:
 *  - A menu (`NailSalonMenu`) where users can select services and quantities.
 *  - A booking form (`NewApptForm`) where users confirm customer info and submit.
 * 
 * Floating navigation buttons allow toggling between the menu and form.
 *
 * @component
 *
 * @param {Object} props - Component props.
 * @param {Object} props.customerInfo - Information about the customer.
 * @param {string} [props.customerInfo.name] - Customer's display name.
 * @param {number} [props.groupSize=1] - Initial group size for the booking.
 * @param {Function} props.onSubmitSuccess - Callback fired after successful form submission.
 *
 * @example
 * <AppointmentBookingLayout
 *   customerInfo={{ name: "Alice" }}
 *   groupSize={3}
 *   onSubmitSuccess={() => console.log("Booking submitted!")}
 * />
 *
 * @returns {JSX.Element} The rendered AppointmentBookingLayout component.
 */
const AppointmentBookingLayout = ({
  customerInfo,
  groupSize: initialGroupSize,
  onSubmitSuccess,
}) => {
  /** @type {[Array, Function]} State for services currently selected by the user */
  const [selectedServices, setSelectedServices] = useState([]);

  /** @type {[boolean, Function]} Whether the booking form is currently shown */
  const [showForm, setShowForm] = useState(false);

  /** @type {[number, Function]} Current group size (defaults to initial prop or 1) */
  const [groupSize, setGroupSize] = useState(initialGroupSize || 1);

  /**
   * Handles changes in service quantity.
   *
   * - If quantity = 0, the service is removed.
   * - If the service exists, update its quantity.
   * - Otherwise, add the service with the new quantity.
   *
   * @param {Object} service - Service object.
   * @param {string|number} service.id - Unique identifier for the service.
   * @param {number} quantity - New quantity selected for the service.
   */
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

  /**
   * Handles changes in group size and ensures service
   * quantities never exceed the group size.
   *
   * @param {number} newSize - The new group size.
   */
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
      <h2 className="text-3xl font-bold mt-2 text-center p-2 hide-on-desktop">
        Select Services
      </h2>

      {customerInfo?.name && (
        <p className="text-lg font-medium text-center mb-2 hide-on-desktop">
          Welcome, {customerInfo.name}!
        </p>
      )}

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

      {/* Floating Buttons */}
      {!showForm && (
        <button
          className="appointment-booking-handle right"
          onClick={() => setShowForm(true)}
        >
          Next
        </button>
      )}

      {showForm && (
        <button
          className="appointment-booking-handle left"
          onClick={() => setShowForm(false)}
        >
          Back
        </button>
      )}
    </div>
  );
};

export default AppointmentBookingLayout;
