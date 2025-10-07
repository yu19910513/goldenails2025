import React, { useState, useEffect, useRef } from "react";
import "./NailServiceIntro.css";

/**
 * @typedef {object} NailServiceIntroProps
 * An empty object as this component currently accepts no props.
 */

/**
 * Renders an introductory section for nail services, featuring a
 * text description and an auto-cycling image carousel.
 *
 * The component implements an auto-play feature for the images,
 * and uses IntersectionObserver to trigger fade-in animations
 * when the component scrolls into view. Clicking the image advances it.
 *
 * @param {NailServiceIntroProps} props - Component props (none required).
 * @returns {JSX.Element} The NailServiceIntro component.
 */
const NailServiceIntro = () => {
  const images = [
    "images/intro_004.jpg",
    "images/intro_002.jpg",
    "images/intro_003.jpg",
    "images/intro_001.jpg"
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);

  /**
   * Advances the current image index by one, wrapping around to the start
   * of the array if the end is reached.
   *
   * This function is used for both the auto-play timer and manual clicks.
   */
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  /**
   * Event handler for when the image section is clicked.
   * Advances to the next image.
   */
  const handleImageClick = () => {
    goToNextImage();
  };

  /**
   * Hook to handle side effects:
   * 1. Sets up an interval for auto-cycling the images every 5 seconds.
   * 2. Initializes an IntersectionObserver to detect when the image and text
   * elements enter the viewport, setting state for fade-in animations.
   *
   * Includes a cleanup function to clear both the interval and the observer
   * when the component unmounts.
   */
  useEffect(() => {
    const intervalId = setInterval(goToNextImage, 5000);

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
      { threshold: 0.4 }
    );

    if (imageRef.current) observer.observe(imageRef.current);
    if (textRef.current) observer.observe(textRef.current);

    return () => {
      clearInterval(intervalId);
      if (imageRef.current) observer.unobserve(imageRef.current);
      if (textRef.current) observer.unobserve(textRef.current);
    };
  }, [images.length]);

  return (
    <div className="nail-service-container">
      <div ref={textRef} className={`nail-service-text-section ${isTextVisible ? "nail-service-fade-in-left" : ""}`}>
        <h2 className="nail-service-title">Elegant Beauty</h2>
        <h1 className="nail-service-heading">Nail Services</h1>
        <p className="nail-service-description">
          Indulge in a luxurious nail care experience at Golden Nails in Gig Harbor. Our expert technicians offer a wide range of services, including manicures, pedicures, gel nails, and nail art, all designed to enhance the beauty of your hands and feet. Whether you’re looking for a classic look or a trendy design, we have something to suit every style.
        </p>
        <p className="nail-service-note">
          For same-day appointments, please{" "}
          <a href="tel:+12538517563" className="nail-service-link">
            contact the salon
          </a>{" "}
          to check for availability.
        </p>
        <p className="nail-service-gratuity">
          <em>
            We gladly accept cash, checks, and credit cards for payment. However, due to the fees associated with credit card transactions, we apply a 3.5% additional charge on all credit card payments.
          </em>
        </p>
      </div>
      <div className="nail-service-image-section" onClick={handleImageClick}>
        <img
          ref={imageRef}
          src={images[currentImageIndex]}
          alt="Nail Services"
          className={`nail-service-image ${isImageVisible ? "nail-service-fade-in-right" : ""}`}
        />
      </div>
    </div>
  );
};

export default NailServiceIntro;