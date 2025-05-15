import React, { useState, useEffect } from "react";
import ItemService from "../../services/itemService";
import { formatPrice } from "../../utils/helper";

const ServiceSelection = ({ customerInfo, onSelectServices, onNext }) => {
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});

  // Load selected services from localStorage if available
  useEffect(() => {
    const storedServices = JSON.parse(localStorage.getItem("selectedServices"));
    if (storedServices) {
      setSelectedServices(storedServices);
    }

    const fetchData = async () => {
      const response = await ItemService.getAll();
      setCategories(response.data);
    };
    fetchData();
  }, []);

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
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="border p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {category.services.map((service) => (
                <div
                  key={service.id}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg ${selectedServices[category.id]?.some((s) => s.id === service.id)
                      ? "bg-yellow-200"
                      : "bg-white"
                    }`}
                  onClick={() => toggleService(category.id, service)}
                >
                  <h4 className="absolute top-2 left-2 text-lg font-bold">{service.name}</h4>
                  <p className="absolute top-2 right-2 text-sm text-gray-600">{formatPrice(service.price)}</p>
                  <p className="mt-5 text-sm text-gray-600">{service.time} min</p>
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
          className={`px-6 py-3 text-lg font-semibold rounded-full transition-colors ${Object.values(selectedServices).some(
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
