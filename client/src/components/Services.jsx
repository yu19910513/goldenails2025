// components/Services.jsx
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
  
  export default Services;
  