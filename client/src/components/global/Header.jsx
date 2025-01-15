import React from "react";
import { useLocation } from "react-router-dom"; // Import the hook for tracking the current path
import "./Header.css"; // Import the external CSS

const Header = () => {
  const location = useLocation(); // Get the current location

  // Function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <nav>
        <ul className="nav-list">
          <li>
            <a
              href="/"
              className={`nav-link ${isActive("/") ? "active-link" : ""}`}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#services"
              className={`nav-link ${isActive("#services") ? "active-link" : ""}`}
            >
              Services
            </a>
          </li>
          <li>
            <a
              href="#team"
              className={`nav-link ${isActive("#team") ? "active-link" : ""}`}
            >
              Our Team
            </a>
          </li>
          <li>
            <a
              href="/booking"
              className={`nav-link ${isActive("/booking") ? "active-link" : ""}`}
            >
              Book Now
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
