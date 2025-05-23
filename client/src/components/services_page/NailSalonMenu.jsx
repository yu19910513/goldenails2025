import React, { useEffect, useState } from 'react';
import './NailSalonMenu.css';
import ItemService from '../../services/itemService';
import { formatPrice } from '../../utils/helper';

const NailSalonMenu = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await ItemService.getAll();
        setServices(response.data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch services.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className='page-container'>
      <div className="menu-container">
        {services.map((category) => (
          <div className="menu-section" key={category.id}>
            <h2 className="menu-category">{category.name}</h2>
            <table className="menu-table">
              <tbody>
                {category.services.map((service) => (
                  <tr key={service.id}>
                    <td className="item-name">{service.name}</td>
                    <td className="item-price">{formatPrice(service.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NailSalonMenu;
