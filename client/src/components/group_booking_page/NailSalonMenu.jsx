import React, { useEffect, useState } from "react";
import "./GroupBooking.css";
import ItemService from "../../services/itemService";
import { formatPrice } from "../../utils/helper";

const NailSalonMenu = ({ selectedServices, onServiceQuantityChange, groupSize }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await ItemService.getAll();
        setServices(response.data);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to fetch services.");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) return <div className="gb-menu-loading">Loading...</div>;
  if (error) return <div className="gb-menu-error">{error}</div>;

  return (
    <div className="gb-menu-page-container">
      <div className="gb-menu-container">
        {services.map((category) => (
          <div className="gb-menu-section" key={category.id}>
            <h2 className="gb-menu-category">{category.name}</h2>
            <table className="gb-menu-table">
              <tbody>
                {category.services.map((service) => {
                  const selected = selectedServices.find((s) => s.id === service.id);
                  const quantity = selected ? selected.quantity : 0;
                  return (
                    <tr
                      key={service.id}
                      className={`gb-menu-item-row ${quantity > 0 ? "selected" : ""
                        }`}
                    >
                      <td className="gb-menu-item-name">{service.name}</td>
                      <td className="gb-menu-item-price">{formatPrice(service.price)}</td>
                      <td>
                        <select
                          value={quantity}
                          onChange={(e) =>
                            onServiceQuantityChange(service, parseInt(e.target.value))
                          }
                        >
                          {[...Array(groupSize + 1).keys()].map((num) => (
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NailSalonMenu;