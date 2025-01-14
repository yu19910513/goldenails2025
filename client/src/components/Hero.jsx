import { useState } from "react";

const Hero = () => {
  const [showNote, setShowNote] = useState(false);

  const handleBookNowClick = () => {
    setShowNote(true);

    // Auto-hide the note after 5 seconds
    setTimeout(() => {
      setShowNote(false);
    }, 5000);
  };

  return (
    <section
      className="bg-cover bg-center h-screen text-center text-white flex items-center justify-end p-10 font-serif"
      style={{ backgroundImage: "url('/images/spa-background.jpg')" }}
    >
      <div className="p-8 rounded-lg max-w-3xl -ml-10 animate-fadeIn md:mr-20">
        {/* Elegant "Golden Nails & SPA" heading */}
        <h1
          style={{ fontFamily: "Dancing Script, cursive", color: "#C79900" }}
          className="text-8xl font-extrabold mb-8 drop-shadow-lg animate-goldenFadeIn"
        >
          Golden Nails
        </h1>

        <div className="mb-8">
          {/* Refined address and hours for readability */}
          <p className="text-lg font-medium text-gray-700 mb-2">
            📍 3610 Grandview St, Ste A, Gig Harbor, WA 98335
          </p>
          <p className="text-lg font-medium text-gray-700">
            🕒 Mon - Sat: 9 AM - 6:30 PM | Sun: Appointment Only
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <a
            href="tel:+12538517563"
            className="border border-yellow-700 text-yellow-700 px-6 py-3 text-lg rounded-full hover:bg-yellow-700 hover:text-white transition duration-300 ease-in-out shadow-sm"
          >
            Call Us Now
          </a>
          <button
            onClick={handleBookNowClick}
            className="border border-yellow-700 text-yellow-700 px-6 py-3 text-lg rounded-full hover:bg-yellow-700 hover:text-white transition duration-300 ease-in-out shadow-sm"
          >
            Book Now
          </button>
        </div>

        {/* Booking Note */}
        {showNote && (
          <div className="mt-6 bg-red-100 text-red-700 px-4 py-3 rounded shadow-md">
            Sorry, the booking system is currently not available. Please call to
            make an appointment.
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
