import React, { useState } from 'react';

const ServiceSelection = ({ onSelectServices, onNext }) => {
  const [selected, setSelected] = useState([]);

  const services = [
    { id: 1, name: 'Manicure' },
    { id: 2, name: 'Pedicure' },
    { id: 3, name: 'Facial' },
  ];

  const toggleService = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h2>Select Services</h2>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            <label>
              <input
                type="checkbox"
                checked={selected.includes(service.id)}
                onChange={() => toggleService(service.id)}
              />
              {service.name}
            </label>
          </li>
        ))}
      </ul>
      <button onClick={() => { onSelectServices(selected); onNext(); }}>Next</button>
    </div>
  );
};

export default ServiceSelection;
