// components/Footer.jsx
import { Link } from 'react-router-dom';  // If you're using React Router for routing
import './Footer.css';  // Import the CSS file for styling

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <small className="footer-text copyright">
        &copy; {new Date().getFullYear()} Golden Nails & SPA. All rights reserved.
      </small>
      <small className="footer-text privacy">
        <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link> | 
        <Link to="/legal-disclaimer" className="footer-link"> Legal Disclaimer</Link>
      </small>
    </div>
  </footer>
);

export default Footer;
