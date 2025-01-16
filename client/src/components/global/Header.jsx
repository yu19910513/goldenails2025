import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import hooks for routing
import "./Header.css"; // Import the external CSS
import LeaveWarningModal from "../booking_page/LeaveWarningModal"

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isBookingActive, setIsBookingActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <header className="header">
      <nav>
        <ul className="nav-list">
          <li
            style={{ display: isBookingActive ? "none" : "block" }} // Hide links when booking is active
          >
            <a href="/" className={`nav-link ${isActive("/") ? "active-link" : ""}`}>
              Home
            </a>
          </li>
          <li
            style={{ display: isBookingActive ? "none" : "block" }} // Hide links when booking is active
          >
            <a href="#services" className={`nav-link ${isActive("#services") ? "active-link" : ""}`}>
              Services
            </a>
          </li>
          <li
            style={{ display: isBookingActive ? "none" : "block" }} // Hide links when booking is active
          >
            <a href="#team" className={`nav-link ${isActive("#team") ? "active-link" : ""}`}>
              Our Team
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
