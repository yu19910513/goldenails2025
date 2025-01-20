import React from 'react';
import './PartnerSection.css'; // Import corresponding CSS file for styling

const PartnerSection = () => {
  return (
    <div className="partner-section">
      <div className="partner-content">
        <h2 className='partner-header'>Beyond Nail Care</h2>
        <p className='partner-context'>
          We believe in caring for more than just your nails.
          That’s why we also focus on nurturing your skin. We’re proud to partner
          with Squidio, a local soap artisan specializing in handmade soaps crafted
          from premium, natural ingredients. Together, we bring you the best in
          holistic care, ensuring you leave feeling refreshed and rejuvenated. 
          Contact us for pricing, samples, and inventory!
        </p>
      </div>
      <div className="partner-photo">
        <a href="https://www.squidiohandmadesoap.com/home">
          <img
            src="/images/squidio.jpg"
            alt="Handmade soap by Squidio"
            className="partner-image"
          />
        </a>
      </div>

    </div>
  );
};

export default PartnerSection;