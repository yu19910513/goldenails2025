// components/Hero.jsx
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
  
  export default Hero;
  