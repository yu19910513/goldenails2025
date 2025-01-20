import React, { useState, useEffect, useRef } from "react";
import "./NailServiceIntro.css";

const NailServiceIntro = () => {
  const images = [
    "images/nail_3.PNG", // First image
    "images/nail_2.PNG", // Second image
    "images/nail_1.PNG", // Third image
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageRef = useRef(null); // Reference for the image
  const textRef = useRef(null); // Reference for the text section
  const [isImageVisible, setIsImageVisible] = useState(false); // Track image visibility
  const [isTextVisible, setIsTextVisible] = useState(false); // Track text visibility

  const handleImageClick = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Set up the IntersectionObserver to detect when the image and text enter the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === imageRef.current && entry.isIntersecting) {
            setIsImageVisible(true);
          }
          if (entry.target === textRef.current && entry.isIntersecting) {
            setIsTextVisible(true);
          }
        });
      },
      { threshold: 0.4 } // Trigger when 50% of the element is visible
    );

    if (imageRef.current) observer.observe(imageRef.current);
    if (textRef.current) observer.observe(textRef.current);

    return () => {
      if (imageRef.current) observer.unobserve(imageRef.current);
      if (textRef.current) observer.unobserve(textRef.current);
    };
  }, []);

  return (
    <div className="container">
      <div ref={textRef} className={`text-section ${isTextVisible ? "fade-in-left" : ""}`}>
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
            We gladly accept cash, checks, and credit cards for payment. However, due to the fees associated with credit card transactions, we apply a 3.5% additional charge on all credit card payments.
          </em>
        </p>
      </div>
      <div className="image-section" onClick={handleImageClick}>
        <img
          ref={imageRef}
          src={images[currentImageIndex]}
          alt="Nail Services"
          className={`image ${isImageVisible ? "fade-in-right" : ""}`}
        />
      </div>
    </div>
  );
};

export default NailServiceIntro;
