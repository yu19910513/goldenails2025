import { React } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/global/Header';
import Footer from './components/global/Footer';
import Home from './pages/home';
import Booking from './pages/booking';
import GroupBooking from './pages/groupBooking';
import AppointmentHistory from './pages/appointmentHistory';
import Config from './pages/config';
import ServicesMenu from './pages/servicemenu';
import ContactForm from './pages/contactForm';
import LegalDisclaimer from './components/policy_and_disclaimer/LegalDisclaimer';
import PrivacyPolicy from './components/policy_and_disclaimer/PrivacyPolicy';
import PasswordlessLogin from './pages/passwordlessLogin';
import PrivateRoute from './components/utils/PrivateRoute';
import ProtectedRoute from './components/utils/ProtectedRoute'
import Dashboard from './pages/dashboard';

// Main App Component
const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PasswordlessLogin />} />
      <Route path="/config" element={<PrivateRoute><Config /></PrivateRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/appointmenthistory" element={<AppointmentHistory />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/groupbooking" element={<GroupBooking />} />
      <Route path="/ourservices" element={<ServicesMenu />} />
      <Route path="/contact" element={<ContactForm />} />
      <Route path="/legal-disclaimer" element={<LegalDisclaimer />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
    <Footer />
  </Router>
);


export default App
