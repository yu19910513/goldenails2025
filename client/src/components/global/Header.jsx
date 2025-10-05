import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import LeaveWarningModal from "../booking_page/LeaveWarningModal";
import { isTokenValid } from '../../utils/helper';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isBookingActive, setIsBookingActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Toggle booking state
  const handleBookingToggle = () => {
    if (isBookingActive) {
      setIsModalOpen(true); // Ask for confirmation before canceling
    } else {
      setIsBookingActive(true);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(isTokenValid(token));
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/booking" || location.pathname === "/groupbooking") {
      setIsBookingActive(true);
    } else {
      setIsBookingActive(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLeaveBooking = () => {
    localStorage.clear();
    setIsBookingActive(false);
    setIsLoggedIn(false);
    navigate("/");
    setIsModalOpen(false);
  };

  const handleCancelLeave = () => {
    setIsModalOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <header className="header">
      <nav>
        <div className={`hamburger ${isMenuOpen ? "open" : ""}`} onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

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
            <a href="/aboutus" className={`nav-link ${isActive("/aboutus") ? "active-link" : ""}`}>
              About Us
            </a>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/appointmenthistory" className={`nav-link ${isActive("/appointmenthistory") ? "active-link" : ""}`}>
              Appointment History
            </a>
          </li>
          <li>
            <a
              href={isBookingActive ? "/" : "/bookingchoice"}
              className={`nav-link ${isBookingActive ? "active-link" : ""}`}
              onClick={(e) => {
                if (isBookingActive) {
                  e.preventDefault();
                  handleBookingToggle();
                }
              }}
            >
              {isBookingActive ? "Cancel Booking" : "Book Now"}
            </a>
          </li>

          {isLoggedIn && (
            <>
              <li>
                <a href="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active-link" : ""}`}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="nav-link" onClick={handleLogout}>
                  Log Out
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>

      <LeaveWarningModal
        isOpen={isModalOpen}
        onLeave={handleLeaveBooking}
        onCancel={handleCancelLeave}
      />
    </header>
  );
};

export default Header;