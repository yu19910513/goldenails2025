import React, { useState } from "react";
import NailSalonBooking from "./Booking"; // Import the booking form component
import './Header.css';

const Header = () => {
  // State to control the modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false);

  return (
    <header
      className="p-8 shadow-lg"
      style={{
        background: "linear-gradient(135deg, #fff8e7, #fde3cf)",
      }}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Title */}
        <div>
          <h1
            className="text-6xl font-bold leading-none"
            style={{
              fontFamily: "'Satisfy', cursive",
              color: "gold",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            Golden
          </h1>
          <p
            className="text-3xl font-semibold text-gray-700 tracking-wide mt-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Nails & SPA
          </p>
          <p
            className="text-sm text-gray-500 italic mt-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Open Hours:{" "}
            <span className="text-pink-500">Mon-Sat: 9am - 7pm</span>,{" "}
            <span className="text-gray-600">Sun: Closed</span>
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-8">
          <a
            href="#services"
            className="text-gray-700 hover:text-pink-500 transition-colors duration-300 font-medium text-lg"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Services
          </a>
          <a
            href="#about"
            className="text-gray-700 hover:text-pink-500 transition-colors duration-300 font-medium text-lg"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            About
          </a>
          <a
            href="#contact"
            className="text-gray-700 hover:text-pink-500 transition-colors duration-300 font-medium text-lg"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Contact
          </a>
          <button
            onClick={openModal}
            className="text-gray-700 hover:text-pink-500 transition-colors duration-300 font-medium text-lg"
          >
            Book Appointment
          </button>
        </nav>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          onClick={closeModal} // Close modal when clicking outside
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
            className="bg-white p-6 rounded-md shadow-lg max-w-lg w-full"
          >
            <NailSalonBooking />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-xl font-bold text-gray-700"
            >
              &times; {/* Close button */}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
