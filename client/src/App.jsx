import { React } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/global/Header';
import Footer from './components/global/Footer';
import Home from './pages/home';
import Booking from './pages/booking';
import ServicesMenu from './pages/servicemenu';

// Main App Component
const App = () => (
  <Router>
    <Header />
    <Routes>
      <Route path="/" element={<><Home /></>} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/ourservices" element={<ServicesMenu />} />
    </Routes>
    <Footer />
  </Router>
);


export default App
