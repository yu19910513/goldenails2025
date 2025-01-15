import React, { useState } from 'react';

const TechnicianSelection = ({ selectedServices, onSelectTechnicians, onNext, onBack }) => {
  const [selected, setSelected] = useState([]);

  const technicians = [
    { id: 1, name: 'Technician A', services: [1, 2] },
    { id: 2, name: 'Technician B', services: [3] },
  ];

  const toggleTechnician = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h2>Select Technicians</h2>
      <ul>
        {technicians.map((tech) =>
          tech.services.some((s) => selectedServices.includes(s)) ? (
            <li key={tech.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(tech.id)}
                  onChange={() => toggleTechnician(tech.id)}
                />
                {tech.name}
              </label>
            </li>
          ) : null
        )}
      </ul>
      <button onClick={onBack}>Back</button>
      <button onClick={() => { onSelectTechnicians(selected); onNext(); }}>Next</button>
    </div>
  );
};

export default TechnicianSelection;
