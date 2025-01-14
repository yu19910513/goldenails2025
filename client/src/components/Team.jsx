import React from 'react';
import './Team.css'; // Add this stylesheet

const Team = () => {
  const technicians = [
    {
      name: 'Tracy',
      photo: '/images/sophia.jpg', // Replace with actual image paths
      details: 'Tracy is a nail art expert with 10+ years of experience in designs and spa treatments. Specializes in organic pedicures and French tips.',
    },
    {
      name: 'Lisa',
      photo: '/images/james.jpg', // Replace with actual image paths
      details: 'Lisa excels in acrylics and dipping powder techniques. Known for his precision and creativity, ensuring every customer leaves satisfied.',
    },
    {
      name: 'Helen',
      photo: '/images/emily.jpg', // Replace with actual image paths
      details: 'Helen specializes in facials and waxing services, providing relaxing treatments tailored to each client’s needs.',
    },
    {
      name: 'Kelly',
      photo: '/images/liam.jpg', // Replace with actual image paths
      details: 'Kelly is skilled in gel extensions and intricate nail designs. He takes pride in creating unique looks for special occasions.',
    },
    {
      name: 'Jenny',
      photo: '/images/liam.jpg', // Replace with actual image paths
      details: 'Jenny is skilled in gel extensions and intricate nail designs. He takes pride in creating unique looks for special occasions.',
    },
  ];

  return (
    <div className="technician-container">
      <div className="technician-grid">
        {technicians.map((technician, index) => (
          <div className="technician-card" key={index}>
            <img src={technician.photo} alt={`${technician.name}`} className="technician-photo" />
            <h2 className="technician-name">{technician.name}</h2>
            <p className="technician-details">{technician.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
