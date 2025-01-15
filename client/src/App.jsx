import { React } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/home';
import Booking from './pages/booking';

// Main App Component
const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<><Home /></>} />
      <Route path="/booking" element={<Booking />} />
    </Routes>
    <Footer />
  </Router>
);


export default App
