const Hero = () => (
  <section className="bg-cover bg-center h-screen text-center text-white flex items-center justify-center font-serif"
    style={{ backgroundImage: "url('/images/spa-background.jpg')" }}>
    <div className="bg-white bg-opacity-70 p-10 rounded-md max-w-3xl mx-auto">
      {/* Bold and larger "Golden Nails & SPA" heading */}
      <h2 style={{ fontFamily: 'Dancing Script, cursive', color: '#C79900' }} className="text-7xl font-extrabold mb-4 drop-shadow-2xl">
        Golden Nails & SPA
      </h2>

      <div className="mb-6">
        {/* Increased font size and darker color for better readability */}
        <p className="text-xl font-semibold mb-2 text-gray-800">📍 3610 Grandview St, Ste A, Gig Harbor, WA 98335</p>
        <p className="text-xl font-semibold text-gray-800">🕒 Hours: Mon - Sat: 9 AM - 6:30 PM | Sun: Appointment Only</p>
      </div>

      <div className="space-x-4">
        <a href="tel:+12538517563" className="bg-yellow-500 text-black px-6 py-3 rounded-lg text-lg hover:bg-yellow-600 transition duration-300">Call Us</a>
        <a href="#booking" className="bg-yellow-500 text-black px-6 py-3 rounded-lg text-lg hover:bg-yellow-600 transition duration-300">Book Now</a>
      </div>
    </div>
  </section>
);

export default Hero;
