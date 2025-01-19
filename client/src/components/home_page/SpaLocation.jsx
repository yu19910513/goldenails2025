import React from 'react';
import './SpaLocation.css'; // Import the CSS file

const SpaLocation = () => {
  return (
    <div className="spa-container">
      <div className="social-section">
        <h1 className="social-heading">Find Us On Social</h1>
        <div className="social-images">
          <img src="image1.jpg" alt="Forest Lodge" className="social-image" />
          <img src="image2.jpg" alt="Winter Mornings" className="social-image" />
          <img src="images/gigharbor.png" alt="Rooms Open" className="social-image" />
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
              <li><a href="/donations">Donation Requests</a></li>
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
            <p>Sun: By Appointment Only</p>
            <p>Phone: <a href="tel:12538517563">+1 (253) 851-7563</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaLocation;
