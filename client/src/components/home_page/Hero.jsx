import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleBookNow = () => {
    // Navigate to /booking and trigger any required state changes
    navigate("/booking", { state: { isBookingActive: true } });
  };

  return (
    <section
      className="bg-cover bg-center h-screen text-center text-white flex items-center justify-center p-10 font-serif hero"
      style={{ backgroundImage: "url('/images/spa-background.jpg')" }}
    >
      <div className="p-8 rounded-lg max-w-3xl animate-fadeIn mx-auto md:mr-20">
        <h1
          style={{ fontFamily: "Didot, Georgia", color: "#06402B" }}
          className="text-8xl font-extrabold mb-8 drop-shadow-lg animate-goldenFadeIn"
        >
          Golden Nails
        </h1>

        <div className="mb-8" style={{ fontFamily: "Optima, arial", color: "#06402B" }}>
          <p className="text-lg font-medium text-gray-700 mb-2">
            📍 3610 Grandview St, Ste A, Gig Harbor, WA 98335
          </p>
          <p className="text-lg font-medium text-gray-700">
            🕒 Mon - Sat: 9 AM - 6:30 PM | Sun: Appointment Only
          </p>
        </div>

        <div className="flex justify-center space-x-4" style={{ fontFamily: "Optima, arial" }}>
          <a
            href="tel:+12538517563"
            className="border border-yellow-700 text-yellow-700 px-6 py-3 text-lg hover:bg-yellow-700 hover:text-white transition duration-300 ease-in-out shadow-sm"
          >
            Call Us Now
          </a>
          <button
            onClick={handleBookNow}
            className="border border-yellow-700 text-yellow-700 px-6 py-3 text-lg hover:bg-yellow-700 hover:text-white transition duration-300 ease-in-out shadow-sm"
          >
            Book Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
