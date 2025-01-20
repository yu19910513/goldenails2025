import React from 'react';
import './ServiceCards.css';

const ServiceCards = () => {


  const services = [
    {
      title: "Nail Care",
      description: "Pamper your nails with our expert manicure and pedicure services, using premium products for a flawless finish.",
      pricing: { Basic: 25, Signature: 40, Deluxe: 60 },
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhA1RXWgyuIHCZ-KUwfX2UjxSaOQek5H6yIw&s",
    },
    {
      title: "Facial Services",
      description: "Relax and rejuvenate your skin with our specialized facial massages designed to promote circulation and glow.",
      pricing: { 35: 45, 60: 60 },
      image: "https://www.lydiasarfati.com/wp-content/uploads/2024/03/Face-Massage-Stock-Image-scaled.jpeg",
    },
    {
      title: "Waxing",
      description: "Experience smooth and silky skin with our professional waxing services tailored for your comfort.",
      pricing: { Eyebrows: 15, Bikini: 40, Back: 60 },
      image: "https://www.lashandcompany.com/mi-dearborn/wp-content/uploads/sites/6/2021/05/wax-2.png",
    },
  ];

  return (
    <div className="horizontal-scroll-container">
      <div className="service-cards-container">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <div className="image-wrapper">
              <img src={service.image} alt={service.title} className="service-image" />
              <div className="service-title">{service.title}</div>
            </div>
            <p className="service-description">{service.description}</p>
            <div className="pricing">
              <h4>Pricing</h4>
              <ul>
                {Object.entries(service.pricing).map(([key, price]) => (
                  <li key={key}>
                    {isNaN(key)
                      ? `${key.charAt(0).toUpperCase() + key.slice(1)}: $${price}`
                      : `${key} min: $${price}`}
                  </li>
                ))}
              </ul>
            </div>
            <a className="book-button" href="/ourservices">Detail</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCards;
