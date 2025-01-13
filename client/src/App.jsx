import { useState, React } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// Header Component
const Header = () => (
  <header className="bg-gray-900 text-white p-4 shadow-md">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-2xl font-bold">Golden Nails & SPA</h1>
      <nav className="flex space-x-4">
        <a href="#services" className="hover:underline">Services</a>
        <a href="#about" className="hover:underline">About</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </nav>
    </div>
  </header>
);

// Hero Section Component
const Hero = () => (
  <section className="bg-cover bg-center h-screen text-center text-white flex items-center justify-center" 
           style={{ backgroundImage: "url('/images/spa-background.jpg')" }}>
    <div className="bg-black bg-opacity-50 p-10 rounded">
      <h2 className="text-4xl font-bold mb-4">Relax, Rejuvenate, Revive</h2>
      <p className="text-lg mb-6">Experience luxury nail care and spa treatments in the heart of Gig Harbor.</p>
      <a href="#services" className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600">Explore Services</a>
    </div>
  </section>
);

// Services Section Component
const Services = () => (
  <section id="services" className="py-16 bg-gray-100">
    <div className="container mx-auto text-center">
      <h3 className="text-3xl font-bold mb-8">Our Services</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: "Manicure", description: "Classic, French, or Gel manicure tailored to perfection." },
          { title: "Pedicure", description: "Pamper your feet with our luxurious pedicures." },
          { title: "Spa Packages", description: "Relax with our tailored spa packages." },
          { title: "Waxing", description: "Smooth, hair-free skin with professional waxing services." },
          { title: "Facials", description: "Rejuvenate your skin with our expert facial treatments." },
          { title: "Massage Therapy", description: "Relaxing massages to melt away stress." },
        ].map((service, index) => (
          <div key={index} className="p-6 bg-white rounded shadow-md">
            <h4 className="text-xl font-bold mb-2">{service.title}</h4>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// About Section Component
const About = () => (
  <section id="about" className="py-16 bg-white">
    <div className="container mx-auto text-center">
      <h3 className="text-3xl font-bold mb-8">About Us</h3>
      <p className="text-lg leading-relaxed">
        Located in the beautiful Gig Harbor, Golden Nails & SPA offers a tranquil escape from the busy
        world. Our skilled team provides top-quality nail and spa services, ensuring you leave
        refreshed and satisfied.
      </p>
    </div>
  </section>
);

// Contact Section Component
const Contact = () => (
  <section id="contact" className="py-16 bg-gray-100">
    <div className="container mx-auto text-center">
      <h3 className="text-3xl font-bold mb-8">Contact Us</h3>
      <p className="mb-4">3610 Grandview St, Ste A, Gig Harbor, WA 98335</p>
      <p className="mb-4">Call us: (253) 222-9800</p>
      <p>Email: golden.nails.spa@example.com</p>
    </div>
  </section>
);

// Footer Component
const Footer = () => (
  <footer className="bg-gray-900 text-white py-4">
    <div className="container mx-auto text-center">
      <p>&copy; {new Date().getFullYear()} Golden Nails & SPA. All rights reserved.</p>
    </div>
  </footer>
);

// Main App Component
const App = () => (
  <div>
    <Header />
    <Hero />
    <Services />
    <About />
    <Contact />
    <Footer />
  </div>
);


export default App
