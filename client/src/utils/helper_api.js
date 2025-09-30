import AppointmentService from "../services/appointmentService";
import TechnicianService from "../services/technicianService";
import {
  calculateAvailableSlots,
  groupServicesByCategory,
  formatTime,
  getBusinessHours,
  distributeItems,
  assignTechnicians
} from "./helper";

/**
 * Calculates the intersection of available appointment slots across multiple technicians.
 *
 * For each technician:
 * 1. Retrieves existing appointments via `AppointmentService.findByTechId`.
 * 2. Groups the current appointment's services by category using `groupServicesByCategory`.
 * 3. Computes available time slots with `calculateAvailableSlots`.
 * 4. Intersects the slots with the previous technicians to find common available times.
 *
 * @async
 * @function getCommonAvailableSlots
 * @param {Array<Object|null>} assignedTechs - Array of technician objects {id, name}, or null for unassigned.
 * @param {Array<Array<Object>>} appointments - Array of appointments, each being an array of service objects {id, category_id, ...}.
 * @param {string} customerDate - Date string in YYYY-MM-DD format for which slots are calculated.
 * @returns {Promise<Array<Date>>} Promise resolving to an array of Date objects representing the common available time slots.
 *
 * @example
 * const techs = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
 * const appointments = [
 *   [{ id: "svc1", category_id: 10 }],
 *   [{ id: "svc2", category_id: 20 }]
 * ];
 * const availableSlots = await getCommonAvailableSlots(techs, appointments, "2025-09-28");
 * console.log(availableSlots);
 */

const getCommonAvailableSlots = async (assignedTechs, appointments, customerDate) => {
  let commonSlots = null;

  for (let i = 0; i < assignedTechs.length; i++) {
    const tech = assignedTechs[i];
    if (!tech) continue;

    const appt = appointments[i];
    const res = await AppointmentService.findByTechId(tech.id);
    const techAppointments = Array.isArray(res.data) ? res.data : [];

    const slots = calculateAvailableSlots(
      techAppointments,
      groupServicesByCategory(appt),
      customerDate,
      getBusinessHours(customerDate),
      tech
    );

    if (!commonSlots) {
      commonSlots = slots;
    } else {
      const slotTimes = new Set(slots.map(s => s.getTime()));
      commonSlots = commonSlots.filter(s => slotTimes.has(s.getTime()));
    }
  }

  return commonSlots || [];
};

/**
 * Fetches available appointment slots and generates appointment forms for a given date, services, and group size.
 *
 * This function:
 * 1. Expands each selected service according to its quantity.
 * 2. Groups services into appointments based on the provided group size.
 * 3. Fetches available technicians for each appointment group.
 * 4. Assigns technicians to appointments using `assignTechnicians`.
 * 5. Computes common available time slots across all assigned technicians using a provided `getSlots` function.
 * 6. Generates appointment "forms" with date, time, technician, and services included.
 *
 * @async
 * @function fetchAvailability
 * @param {string} date - The selected date in YYYY-MM-DD format.
 * @param {Array<Object>} selectedServices - Array of service objects:
 *   { id: number|string, name: string, category_id: number|string, quantity: number }.
 * @param {number} groupSize - Number of people in the group; used to distribute services into appointments.
 * @param {Function} [getSlots=getCommonAvailableSlots] - Optional function to calculate common available slots.
 *   Should have signature `(assignedTechs: Array<Object>, appointments: Array<Array<Object>>, date: string) => Promise<Array<Date>>`.
 * @returns {Promise<Object>} Promise resolving to an object with:
 *   @property {Array<Object>} forms - Generated appointment forms, each containing:
 *     - date {string} - Appointment date
 *     - time {string} - Selected time slot (formatted)
 *     - technician {Object|null} - Assigned technician {id, name} or null
 *     - services {Array<Object>} - Array of services included in this appointment
 *   @property {Array<Date>} times - Array of available Date objects for the selected date
 *
 * @example
 * const { forms, times } = await fetchAvailability(
 *   "2025-09-28",
 *   [{ id: 1, name: "Haircut", category_id: 10, quantity: 2 }],
 *   2
 * );
 * console.log(forms, times);
 */

const fetchAvailability = async (date, selectedServices, groupSize, getSlots = getCommonAvailableSlots) => {
  if (!date || selectedServices.length === 0) return { forms: [], times: [] };

  const servicePool = selectedServices.flatMap(s => Array(s.quantity).fill(s));
  let appointments = distributeItems(servicePool, groupSize).filter(a => a.length > 0);
  if (appointments.length === 0) return { forms: [], times: [] };

  const appointmentTechMap = await Promise.all(
    appointments.map(async (appt) => {
      const categoryIds = [...new Set(appt.map(s => s.category_id))];
      const res = await TechnicianService.getAvailableTechnicians(categoryIds);
      return Array.isArray(res.data) ? res.data : [];
    })
  );

  const assignedTechs = assignTechnicians(appointmentTechMap);
  const commonSlots = await getSlots(assignedTechs, appointments, date);

  const forms = appointments.map((appt, idx) => ({
    date,
    time: commonSlots?.[0] ? formatTime(commonSlots[0]) : "",
    technician: assignedTechs[idx]
      ? { id: assignedTechs[idx].id, name: assignedTechs[idx].name }
      : null,
    services: appt
  }));

  console.log("Appointments (services grouped):", appointments);
  console.log("Assigned Technicians:", assignedTechs);

  return { forms, times: commonSlots || [] };
};

export {
  getCommonAvailableSlots,
  fetchAvailability
}