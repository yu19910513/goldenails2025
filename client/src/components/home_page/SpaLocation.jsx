import React from 'react';
import './SpaLocation.css'; // Import the CSS file
import LoginStatus from '../utils/LoginStatus';

const SpaLocation = () => {
  return (
    <div className="spa-container">
      <div className="social-section">

        <img src="images/gigharbor.png" alt="Rooms Open" className="social-image" />
        <div className="textsection">
          <h1 className="locationheading">Charming, Coastal, Peaceful</h1>
          <p className="locationdescription">
            Golden Nails & Spa is nestled in the heart of picturesque Gig Harbor, WA, surrounded by charming waterfront views and a welcoming community. Conveniently located just minutes from downtown, our spa is the perfect destination to relax and enjoy the vibrant yet tranquil atmosphere of this coastal town.
          </p>
        </div>
      </div>

      <div className="map-section">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5409.132472310225!2d-122.59197791032685!3d47.32281189681689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x549052c173b4f495%3A0x403b7da1cf56194!2sGolden%20Nails%20%26%20Spa!5e0!3m2!1sen!2sus!4v1737266936339!5m2!1sen!2sus"
          className="map-iframe"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div className="info-section">
        <div className="info-columns">
          <div className="quick-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><LoginStatus targetPath="/dashboard" targetText="Dashboard" /></li>
            </ul>
          </div>

          <div className="divider"></div>

          <div className="getting-here">
            <h3>Getting Here</h3>
            <p>3610 Grandview St, Gig Harbor, WA</p>
          </div>

          <div className="divider"></div>

          <div className="hours">
            <h3>Open Hours</h3>
            <p>Mon-Sat: 9:00 AM – 6:30 PM</p>
            <p>Sun: 11:00 AM - 5:00 PM</p>
            <p>Phone: <a href="tel:12538517563">+1 (253) 851-7563</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaLocation;
