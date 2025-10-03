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

  if (loading) return <div className="nsm-loading">Loading...</div>;
  if (error) return <div className="nsm-error">{error}</div>;

  return (
    <div className='nsm-page-container'>
      <div className="nsm-menu-container">
        {services.map((category) => (
          <div className="nsm-menu-section" key={category.id}>
            <h2 className="nsm-menu-category">{category.name}</h2>
            <table className="nsm-menu-table">
              <tbody>
                {category.services.map((service) => (
                  <tr key={service.id}>
                    <td className="nsm-item-name">{service.name}</td>
                    <td className="nsm-item-price">{formatPrice(service.price)}</td>
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
