import React, { useState, useEffect } from "react";
import ItemService from "../../services/itemService";
import formatPrice from "../../common/utils";

const ServiceSelection = ({ customerInfo, onSelectServices, onNext }) => {
  const [categories, setCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await ItemService.getAll();
      setCategories(response.data);
    };
    fetchData();
  }, []);

  const toggleService = (categoryId, serviceId) => {
    setSelectedServices((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId] === serviceId ? null : serviceId,
    }));
  };

  return (
    <div className="relative">
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
                  className={`p-4 border rounded-lg cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg ${
                    selectedServices[category.id] === service.id
                      ? "bg-yellow-200"
                      : "bg-white"
                  } ${
                    selectedServices[category.id] &&
                    selectedServices[category.id] !== service.id
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                  onClick={() => toggleService(category.id, service.id)}
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
          disabled={!Object.values(selectedServices).some((id) => id)}
          className={`px-6 py-3 text-lg font-semibold rounded-lg transition-colors ${
            Object.values(selectedServices).some((id) => id)
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
