import React, { useState } from "react";
import "./NailServiceIntro.css";

const NailServiceIntro = () => {
  const images = [
    "images/nail_3.PNG", // First image
    "images/nail_2.PNG", // Second image
    "images/nail_1.PNG", // Third image (add as many as you need)
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Initialize with the first image

  const handleImageClick = () => {
    // Increment the index to show the next image
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="container">
      <div className="text-section">
        <h2 className="title">Elegant Beauty</h2>
        <h1 className="heading">Nail Services</h1>
        <p className="description">
          Indulge in a luxurious nail care experience at Golden Nails in Gig Harbor. Our expert technicians offer a wide range of services, including manicures, pedicures, gel nails, and nail art, all designed to enhance the beauty of your hands and feet. Whether you’re looking for a classic look or a trendy design, we have something to suit every style.
        </p>
        <p className="note">
          For same-day appointments, please{" "}
          <a href="tel:+12538517563" className="link">
            contact the salon
          </a>{" "}
          to check for availability.
        </p>
        <p className="gratuity">
          <em>
          We gladly accept cash, checks, and credit cards for payment. However, due to the fees associated with credit card transactions, we apply a 3.5% additional charge on all credit card payments.          </em>
        </p>
      </div>
      <div className="image-section" onClick={handleImageClick}>
        <img
          src={images[currentImageIndex]} // Dynamically load the current image based on the index
          alt="Nail Services"
          className="image"
        />
      </div>
    </div>
  );
};

export default NailServiceIntro;
