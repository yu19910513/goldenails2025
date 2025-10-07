import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import LeaveWarningModal from "../booking_page/LeaveWarningModal";
import { isTokenValid } from "../../utils/helper";
import {
  FaHome,
  FaConciergeBell,
  FaInfoCircle,
  FaHistory,
  FaPlusCircle,
  FaThLarge,
  FaSignOutAlt,
  FaTimes, // For Cancel Booking icon
} from "react-icons/fa";

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
      <div className={`header-overlay ${isMenuOpen ? "header-overlay--open" : ""}`} onClick={toggleMenu}></div>

      <nav className="header-nav">
        <div className={`header-hamburger ${isMenuOpen ? "header-hamburger--open" : ""}`} onClick={toggleMenu}>
          <div className="header-bar"></div>
          <div className="header-bar"></div>
          <div className="header-bar"></div>
        </div>

        {/* --- START: MODIFIED BRANDING SECTION --- */}
        <div className="header-brand-group">
          <a href="/" className={`header-nav-link header-logo-link ${isActive("/") ? "header-nav-link--active" : ""}`}>
            Golden Nails
          </a>
          <img
            src="/images/wbe-halloween-pumpkins.gif" // 👈 IMPORTANT: Update this path to your GIF
            alt="Site Animation"
            className="mobile-header-gif"
          />
        </div>
        {/* --- END: MODIFIED BRANDING SECTION --- */}

        <ul className={`header-nav-list ${isMenuOpen && isMobile ? "header-nav-list--open" : ""}`}>
          <li className="header-logo-placeholder">
            Golden Nails
          </li>

          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/" className={`header-nav-link ${isActive("/") ? "header-nav-link--active" : ""}`}>
              <FaHome className="nav-icon" /> <span>Home</span>
            </a>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/ourservices" className={`header-nav-link ${isActive("/ourservices") ? "header-nav-link--active" : ""}`}>
              <FaConciergeBell className="nav-icon" /> <span>Services</span>
            </a>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/aboutus" className={`header-nav-link ${isActive("/aboutus") ? "header-nav-link--active" : ""}`}>
              <FaInfoCircle className="nav-icon" /> <span>About Us</span>
            </a>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <a href="/appointmenthistory" className={`header-nav-link ${isActive("/appointmenthistory") ? "header-nav-link--active" : ""}`}>
              <FaHistory className="nav-icon" /> <span>My Visits</span>
            </a>
          </li>

          <li className="header-nav-item--separator">
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
              {isBookingActive ? <FaTimes className="nav-icon" /> : <FaPlusCircle className="nav-icon" />}
              <span>{isBookingActive ? "Cancel Booking" : "Book Now"}</span>
            </a>
          </li>

          {isLoggedIn && (
            <>
              <li className="header-nav-item--separator">
                <a href="/dashboard" className={`header-nav-link ${isActive("/dashboard") ? "header-nav-link--active" : ""}`}>
                  <FaThLarge className="nav-icon" /> <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="#" className="header-nav-link" onClick={handleLogout}>
                  <FaSignOutAlt className="nav-icon" /> <span>Log Out</span>
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