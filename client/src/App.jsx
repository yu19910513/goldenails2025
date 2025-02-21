import { React } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/global/Header';
import Footer from './components/global/Footer';
import Home from './pages/home';
import Booking from './pages/booking';
import AppointmentHistory from './pages/appointmentHistory';
import Calendar from './pages/calendar';
import ServicesMenu from './pages/servicemenu';
import ContactForm from './pages/contactForm';
import LegalDisclaimer from './components/policy_and_disclaimer/LegalDisclaimer';
import PrivacyPolicy from './components/policy_and_disclaimer/PrivacyPolicy';

// Main App Component
const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<><Home /></>} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/appointmenthistory" element={<><AppointmentHistory /></>} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/ourservices" element={<ServicesMenu />} />
      <Route path="/contact" element={<ContactForm />} />
      <Route path="/legal-disclaimer" element={<LegalDisclaimer />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
    <Footer />
  </Router>
);


export default App
