import React, { useEffect, useState } from 'react';
import './NailSalonMenu.css'; // Add this stylesheet
import ItemService from '../../services/itemService';
import formatPrice from '../../common/utils';

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
