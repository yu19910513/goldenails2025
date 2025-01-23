import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import hooks for routing
import "./Header.css"; // Import the external CSS
import LeaveWarningModal from "../booking_page/LeaveWarningModal";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isBookingActive, setIsBookingActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for controlling hamburger menu
  const [isMobile, setIsMobile] = useState(false); // Track screen size for responsive design

  const isActive = (path) => location.pathname === path;

  const handleBookingToggle = () => {
    if (isBookingActive) {
      // Show modal when user clicks "Cancel Booking"
      setIsModalOpen(true);
    } else {
      // Navigate to booking page when "Book Now" is clicked
      setIsBookingActive(true);
      navigate("/booking");
    }
  };

  useEffect(() => {
    if (location.pathname === "/booking") {
      setIsBookingActive(true);
    } else {
      setIsBookingActive(false);
    }
  }, [location.pathname]);

  // Detect screen size changes and toggle mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false); // Close the menu when resizing to a larger screen
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check on load

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLeaveBooking = () => {
    // Clear local storage and navigate to home when user confirms exit
    localStorage.clear();
    setIsBookingActive(false);
    navigate("/");
    setIsModalOpen(false); // Close the modal after confirming leave
  };

  const handleCancelLeave = () => {
    // Close the modal without doing anything
    setIsModalOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
  };

  return (
    <header className="header">
      <nav>
        {/* Hamburger button for small screens */}
        <div className={`hamburger ${isMenuOpen ? "open" : ""}`} onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        {/* Navigation links */}
        <a href="/" className={`nav-link gold-nails ${isActive("/") ? "active-link" : ""}`}>
          Golden Nails
        </a>

        <ul className={`nav-list ${isMenuOpen && isMobile ? "open" : ""}`}>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/ourservices" className={`nav-link ${isActive("/ourservices") ? "active-link" : ""}`}>
              Our Services
            </a>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/appointmenthistory" className={`nav-link ${isActive("#team") ? "active-link" : ""}`}>
              Appointment History
            </a>
          </li>
          <li>
            <a href="#" className={`nav-link ${isBookingActive ? "active-link" : ""}`} onClick={handleBookingToggle}>
              {isBookingActive ? "Cancel Booking" : "Book Now"}
            </a>
          </li>
        </ul>
      </nav>

      {/* Use your LeaveWarningModal component */}
      <LeaveWarningModal
        isOpen={isModalOpen}
        onLeave={handleLeaveBooking}
        onCancel={handleCancelLeave}
      />
    </header>
  );
};

export default Header;
