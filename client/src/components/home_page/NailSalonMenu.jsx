import React, { useEffect, useState } from 'react';
import './NailSalonMenu.css'; // Add this stylesheet
import ItemService from '../../services/itemService';

const formatPrice = (price) => {
  // Check for prices ending with 1 or 6
  if (price % 10 === 1 || price % 10 === 6) {
    return `$${price - 1}+`;
  }

  // Check for 4-digit prices (e.g., 1020)
  if (price >= 1000) {
    const low = Math.floor(price / 100);
    const high = price % 100;
    return `$${low} - ${high}`;
  }

  // Default formatting
  return `$${price}`;
};

const NailSalonMenu = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await ItemService.getAll(); // Fetch services from the API
        setServices(response.data); // Set the services data
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to fetch services.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="menu-container">
      <div className="menu-grid">
        {services.map((category) => (
          <div className="menu-card" key={category.id}>
            <h2 className="menu-category">{category.name}</h2>
            <ul className="menu-items">
              {category.services.map((service) => (
                <li className="menu-item" key={service.id}>
                  <span className="item-name">{service.name}</span>
                  <span className="item-price">{formatPrice(service.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NailSalonMenu;
