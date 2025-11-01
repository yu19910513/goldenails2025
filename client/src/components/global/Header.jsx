import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  FaTimes,
} from "react-icons/fa";

/**
 * Renders the main site header and navigation bar.
 * Handles mobile menu toggling, booking state management,
 * and user authentication links.
 */
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- State Declarations ---
  const [isBookingActive, setIsBookingActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * Checks if the given path matches the current location pathname.
   * @param {string} path - The path to check.
   * @returns {boolean} True if the path is active, false otherwise.
   */
  const isActive = (path) => location.pathname === path;

  /**
   * Toggles the booking state.
   */
  const handleBookingToggle = () => {
    if (isBookingActive) {
      setIsModalOpen(true);
    } else {
      setIsBookingActive(true);
    }
  };

  // --- Effects ---

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

  // --- Event Handlers ---

  /**
   * Handles the user's confirmation to leave the booking process.
   */
  const handleLeaveBooking = () => {
    localStorage.clear();
    setIsBookingActive(false);
    setIsLoggedIn(false);
    navigate("/");
    setIsModalOpen(false);
  };

  /**
   * Closes the leave confirmation modal.
   */
  const handleCancelLeave = () => {
    setIsModalOpen(false);
  };

  /**
   * Toggles the mobile menu's open/closed state.
   */
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Logs the user out and navigates to home.
   */
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/");
  };

  /**
   * Closes the mobile menu if it's open.
   * This is called when a navigation link is clicked.
   */
  const handleNavClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  /**
   * Handles the logout click: logs the user out and closes the menu.
   */
  const handleLogoutClick = () => {
    handleLogout();
    handleNavClick();
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

        <div className="header-brand-group">
          <Link
            to="/"
            className={`header-nav-link header-logo-link ${isActive("/") ? "header-nav-link--active" : ""}`}
            onClick={handleNavClick}
          >
            Golden Nails
          </Link>
          <img
            src="/images/wbe-halloween-pumpkins.gif"
            alt="Site Animation"
            className="mobile-header-gif"
          />
        </div>

        <ul className={`header-nav-list ${isMenuOpen && isMobile ? "header-nav-list--open" : ""}`}>
          <li className="header-logo-placeholder">
            Golden Nails
          </li>

          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <Link to="/" className={`header-nav-link ${isActive("/") ? "header-nav-link--active" : ""}`} onClick={handleNavClick}>
              <FaHome className="nav-icon" /> <span>Home</span>
            </Link>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <Link to="/ourservices" className={`header-nav-link ${isActive("/ourservices") ? "header-nav-link--active" : ""}`} onClick={handleNavClick}>
              <FaConciergeBell className="nav-icon" /> <span>Services</span>
            </Link>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <Link to="/aboutus" className={`header-nav-link ${isActive("/aboutus") ? "header-nav-link--active" : ""}`} onClick={handleNavClick}>
              <FaInfoCircle className="nav-icon" /> <span>About Us</span>
            </Link>
          </li>
          <li style={{ display: isBookingActive ? "none" : "block" }}>
            <Link to="/appointmenthistory" className={`header-nav-link ${isActive("/appointmenthistory") ? "header-nav-link--active" : ""}`} onClick={handleNavClick}>
              <FaHistory className="nav-icon" /> <span>My Visits</span>
            </Link>
          </li>

          <li className="header-nav-item--separator">
            <Link
              to={isBookingActive ? "/" : "/bookingchoice"}
              className={`header-nav-link ${isActive("/bookingchoice") ? "header-nav-link--active" : ""}`}
              onClick={(e) => {
                if (isBookingActive) {
                  e.preventDefault(); // Prevent navigation
                  handleBookingToggle();
                }
                handleNavClick();
              }}
            >
              {isBookingActive ? <FaTimes className="nav-icon" /> : <FaPlusCircle className="nav-icon" />}
              <span>{isBookingActive ? "Cancel Booking" : "Book Now"}</span>
            </Link>
          </li>

          {isLoggedIn && (
            <>
              <li className="header-nav-item--separator">
                <Link to="/dashboard" className={`header-nav-link ${isActive("/dashboard") ? "header-nav-link--active" : ""}`} onClick={handleNavClick}>
                  <FaThLarge className="nav-icon" /> <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to="/" className="header-nav-link" onClick={handleLogoutClick}>
                  <FaSignOutAlt className="nav-icon" /> <span>Log Out</span>
                </Link>
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