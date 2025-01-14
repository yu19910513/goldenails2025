import React from 'react';
import './Header.css';  // Import the external CSS

const Header = () => {
  return (
    <header className="header">
      <nav>
        <ul className="nav-list">
          <li><a href="#home" className="nav-link">Home</a></li>
          <li><a href="#services" className="nav-link">Services</a></li>
          <li><a href="#team" className="nav-link">Our Team</a></li>
          <li><a href="#book-now" className="nav-link">Book Now</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
