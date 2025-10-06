import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Header.css"; // Assuming you will update the CSS file to match
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
    <header className="site-header">
      {/* ADDED: Background overlay */}
      <div className={`header-overlay ${isMenuOpen ? "header-overlay--open" : ""}`} onClick={toggleMenu}></div>

      <nav className="header-nav">
        <div className={`header-hamburger ${isMenuOpen ? "header-hamburger--open" : ""}`} onClick={toggleMenu}>
          <div className="header-bar"></div>
          <div className="header-bar"></div>
          <div className="header-bar"></div>
        </div>

        <a href="/" className={`header-nav-link header-logo-link ${isActive("/") ? "header-nav-link--active" : ""}`}>
          Golden Nails
        </a>

        <ul className={`header-nav-list ${isMenuOpen && isMobile ? "header-nav-list--open" : ""}`}>
          {/* ADDED: Logo placeholder for mobile menu */}
          <li className="header-logo-placeholder">
            <img src="/images/full_logo.png" alt="Golden Nails Logo" />
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/" className={`header-nav-link ${isActive("/home") ? "header-nav-link--active" : ""}`}>
              Home
            </a>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/ourservices" className={`header-nav-link ${isActive("/ourservices") ? "header-nav-link--active" : ""}`}>
              Services
            </a>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/aboutus" className={`header-nav-link ${isActive("/aboutus") ? "header-nav-link--active" : ""}`}>
              About Us
            </a>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/appointmenthistory" className={`header-nav-link ${isActive("/appointmenthistory") ? "header-nav-link--active" : ""}`}>
              My Visits
            </a>
          </li>
          <li>
            <a
              href={isBookingActive ? "/" : "/bookingchoice"}
              className={`header-nav-link ${isActive("/bookingchoice") ? "header-nav-link--active" : ""}`}
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
                <a href="/dashboard" className={`header-nav-link ${isActive("/dashboard") ? "header-nav-link--active" : ""}`}>
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="header-nav-link" onClick={handleLogout}>
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