import React, { useEffect, useState } from 'react';
import './Team.css'; // Add this stylesheet
import technicianService from '../../services/technicianService';

const Team = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const response = await technicianService.getAll();
        setTechnicians(response.data);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to fetch technicians.");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="technician-container">
      <div className="technician-grid">
        {technicians
          .filter((technician) => !technician.name.includes(' '))
          .map((technician, index) => (
            <div className="technician-card" key={index}>
              <img
                src="/images/headshot_placeholder.jpg"
                alt={`${technician.name}`}
                className="technician-photo"
              />
              <h2 className="technician-name">{technician.name}</h2>
              <p className="technician-description">{technician.description}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Team;
