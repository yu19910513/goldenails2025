import React, { useEffect, useState } from "react";
import ItemService from "../../services/itemService";
import { formatPrice } from "../../utils/helper";
import "./GroupBooking.css";

/**
 * NailSalonMenu component
 *
 * Displays a categorized menu of nail salon services.
 * Services are fetched asynchronously from the backend via `ItemService.getAll()`.
 * Users can select a quantity for each service (up to the group size), and
 * selections are passed back to the parent via `onServiceQuantityChange`.
 *
 * @component
 *
 * @param {Object} props - Component props.
 * @param {Array<{ id: string|number, name: string, quantity: number }>} props.selectedServices
 *   The currently selected services with their quantities.
 * @param {Function} props.onServiceQuantityChange
 *   Callback fired when a service's quantity is updated.
 *   Receives `(service: Object, quantity: number)`.
 * @param {number} props.groupSize - The total number of guests in the booking (limits max quantity).
 *
 * @example
 * <NailSalonMenu
 *   selectedServices={[{ id: 1, name: "Manicure", quantity: 2 }]}
 *   onServiceQuantityChange={(service, qty) => console.log(service, qty)}
 *   groupSize={3}
 * />
 *
 * @returns {JSX.Element} The rendered NailSalonMenu component.
 */
const NailSalonMenu = ({ selectedServices, onServiceQuantityChange, groupSize }) => {
  /** @type {[Array, Function]} State containing all services fetched from backend */
  const [services, setServices] = useState([]);

  /** @type {[boolean, Function]} Whether the menu is still loading */
  const [loading, setLoading] = useState(true);

  /** @type {[string|null, Function]} Error message if fetching fails */
  const [error, setError] = useState(null);

  /**
   * Fetch available services from backend on mount.
   *
   * @async
   * @returns {Promise<void>}
   */
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
                      className={`gb-menu-item-row ${quantity > 0 ? "selected" : ""}`}
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