import React, { useState, useEffect, useRef } from "react";
import ItemService from "../../services/itemService";
import { formatPrice } from "../../common/utils";

const ServiceSelection = ({ customerInfo, onSelectServices, onNext }) => {
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});
  const categoryRefs = useRef({}); // Store refs for category sections

  // Load selected services from localStorage if available
  useEffect(() => {
    const storedServices = JSON.parse(localStorage.getItem("selectedServices"));
    if (storedServices) {
      setSelectedServices(storedServices);
    }

    const fetchData = async () => {
      const response = await ItemService.getAll();
      setCategories(response.data);
      // Initialize refs for each category
      response.data.forEach((category) => {
        categoryRefs.current[category.id] = React.createRef();
      });
    };
    fetchData();
  }, []);

  // Scroll to a specific category when clicked
  const scrollToCategory = (categoryId) => {
    const categoryElement = categoryRefs.current[categoryId]?.current;
    if (categoryElement) {
      const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0; // Replace '.navbar' with your sticky navbar's class or ID
      const offsetTop = categoryElement.offsetTop - navbarHeight - 16; // Adjust '16' for additional spacing
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };


  // Toggle service selection
  const toggleService = (categoryId, service) => {
    setSelectedServices((prev) => {
      const categoryServices = prev[categoryId] || [];
      const isServiceSelected = categoryServices.some((s) => s.id === service.id);

      const updatedServices = isServiceSelected
        ? categoryServices.filter((s) => s.id !== service.id) // Deselect service
        : [...categoryServices, { id: service.id, name: service.name, time: service.time, price: service.price }]; // Select service

      const newState = { ...prev };
      if (updatedServices.length > 0) {
        newState[categoryId] = updatedServices;
      } else {
        delete newState[categoryId];
      }
      localStorage.setItem("selectedServices", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <div className="relative max-w-[1200px] mx-auto p-4">
      <h2 className="text-3xl font-bold mb-2 text-center p-4">Select Services</h2>
      {customerInfo?.name && (
        <p className="text-lg font-medium text-center mb-6">
          Welcome, {customerInfo.name}!
        </p>
      )}

      {/* Floating Category Bar */}
      <div className="fixed top-1/2 right-0 z-10 bg-pink-100 shadow-lg p-4 transform -translate-y-1/2 rounded-lg">
        <div className="flex flex-col gap-4">
          {/* Category Buttons */}
          {categories.map((category) => (
            <button
              key={category.id}
              className="px-4 py-2 text-sm font-medium bg-pink-200 text-pink-900 rounded-lg hover:bg-pink-300 hover:text-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-md"
              onClick={() => scrollToCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
          {/* Reset Button */}
          <button
            className="mt-4 px-4 py-2 text-sm font-medium bg-red-200 text-red-900 rounded-lg hover:bg-red-300 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-md"
            onClick={() => {
              setSelectedServices({});
              localStorage.removeItem("selectedServices");
            }}
          >
            Reset Selection
          </button>
        </div>
      </div>



      <div className="space-y-6 mt-4">
        {categories.map((category) => (
          <div
            key={category.id}
            ref={categoryRefs.current[category.id]}
            className="border p-4 rounded-lg shadow-md"
          >
            <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {category.services.map((service) => (
                <div
                  key={service.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg ${selectedServices[category.id]?.some((s) => s.id === service.id)
                    ? "bg-yellow-200"
                    : "bg-white"
                    }`}
                  onClick={() => toggleService(category.id, service)}
                >
                  <h4 className="text-lg font-bold">{service.name}</h4>
                  <p className="text-sm text-gray-600">{formatPrice(service.price)}</p>
                  <p className="text-sm text-gray-600">{service.time} min</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Next Button */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => {
            onSelectServices(selectedServices);
            onNext();
          }}
          disabled={!Object.values(selectedServices).some(
            (services) => services && Array.isArray(services) && services.length > 0
          )}
          className={`px-6 py-3 text-lg font-semibold rounded-lg transition-colors ${Object.values(selectedServices).some(
            (services) => services && Array.isArray(services) && services.length > 0
          )
            ? "bg-yellow-500 text-black hover:bg-yellow-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ServiceSelection;
