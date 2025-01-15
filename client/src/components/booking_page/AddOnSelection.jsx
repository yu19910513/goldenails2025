import React, { useState } from 'react';

const AddOnSelection = ({ selectedServices, onSelectAddOns, onNext, onBack }) => {
  const [selectedAddOns, setSelectedAddOns] = useState({});

  const addOns = {
    1: [{ id: '1a', name: 'French Tips' }],
    2: [{ id: '2a', name: 'Hot Stone Massage' }],
  };

  const handleAddOnSelect = (serviceId, addOnId) => {
    setSelectedAddOns((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId] === addOnId ? null : addOnId,
    }));
  };

  return (
    <div>
      <h2>Select Add-Ons</h2>
      {selectedServices.map((serviceId) => (
        <div key={serviceId}>
          <h3>Service {serviceId} Add-Ons</h3>
          <ul>
            {(addOns[serviceId] || []).map((addOn) => (
              <li key={addOn.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedAddOns[serviceId] === addOn.id}
                    onChange={() => handleAddOnSelect(serviceId, addOn.id)}
                  />
                  {addOn.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={onBack}>Back</button>
      <button onClick={() => { onSelectAddOns(selectedAddOns); onNext(); }}>Next</button>
    </div>
  );
};

export default AddOnSelection;
