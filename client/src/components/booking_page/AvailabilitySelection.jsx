import React, { useState } from 'react';

const AvailabilitySelection = ({ selectedTechnicians, onSelectAvailability, onBack, onConfirm }) => {
  const [selected, setSelected] = useState(null);

  const availability = {
    1: ['10:00 AM', '11:00 AM'],
    2: ['12:00 PM', '1:00 PM'],
  };

  return (
    <div>
      <h2>Select Availability</h2>
      {selectedTechnicians.map((techId) => (
        <div key={techId}>
          <h3>Technician {techId} Availability</h3>
          <ul>
            {(availability[techId] || []).map((time, idx) => (
              <li key={idx}>
                <label>
                  <input
                    type="radio"
                    name="availability"
                    value={time}
                    checked={selected === time}
                    onChange={() => setSelected(time)}
                  />
                  {time}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button onClick={onBack}>Back</button>
      <button onClick={() => { onSelectAvailability(selected); onConfirm(); }}>Confirm</button>
    </div>
  );
};

export default AvailabilitySelection;
