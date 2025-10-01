import AppointmentService from "../services/appointmentService";
import TechnicianService from "../services/technicianService";
import {
  calculateAvailableSlots,
  groupServicesByCategory,
  formatTime,
  getBusinessHours,
  distributeItems,
  getCommonAvailableSlots
} from "./helper";

/**
 * Finds the optimal assignment of technicians to appointments using a backtracking algorithm.
 *
 * This function is optimized to perform a single upfront network request to fetch all
 * technician schedules for a given day, preventing multiple API calls during the recursive search.
 * It explores all valid technician combinations and returns the assignment that results in the
 * maximum number of common available time slots.
 *
 * @async
 * @param {Array<Array<object>>} appointmentTechMap - An array where each inner array contains the potential technician objects available for the corresponding appointment.
 * @param {Function} getSlots - A callback function to calculate common available slots for a given assignment. It receives the assigned technicians, appointments, date, and the pre-fetched schedules map.
 * @param {Array<Array<object>>} appointments - An array of appointment objects (service groups), corresponding to each entry in `appointmentTechMap`.
 * @param {string} date - The target date for the appointments in 'YYYY-MM-DD' format.
 * @returns {Promise<{assignedTechs: Array<object>, commonSlots: Array<Date>}>} A promise that resolves to an object containing the best assignment. If no valid assignment is found, the arrays will be empty.
 */
const assignTechnicians = async (appointmentTechMap, getSlots, appointments, date) => {
  let best = { assignedTechs: [], commonSlots: [] };

  const allSchedulesResponse = await TechnicianService.getScheduleByDate(date);
  const schedulesMap = new Map(
    allSchedulesResponse.data.map(tech => [tech.id, tech.Appointments || []])
  );

  const backtrack = async (idx, current, usedTechs) => {
    if (idx === appointmentTechMap.length) {
      if (current.includes(null)) return;

      const slots = await getSlots(current, appointments, date, schedulesMap);

      if (slots.length > best.commonSlots.length) {
        best = { assignedTechs: [...current], commonSlots: slots };
      }
      return;
    }

    const techOptions = appointmentTechMap[idx] || [];
    let tried = false;

    for (const tech of techOptions.filter(t => t && t.name !== "No Preference")) {
      if (usedTechs.has(tech.name)) continue;
      usedTechs.add(tech.name);
      current.push(tech);
      tried = true;
      await backtrack(idx + 1, current, usedTechs);
      current.pop();
      usedTechs.delete(tech.name);
    }

    for (const tech of techOptions.filter(t => t && t.name === "No Preference")) {
      current.push(tech);
      tried = true;
      await backtrack(idx + 1, current, usedTechs);
      current.pop();
    }

    if (!tried) {
      current.push(null);
      await backtrack(idx + 1, current, usedTechs);
      current.pop();
    }
  };

  await backtrack(0, [], new Set());

  if (!best.assignedTechs.length) {
    return { assignedTechs: [], commonSlots: [] };
  }

  return best;
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

  const { assignedTechs, commonSlots } = await assignTechnicians(
    appointmentTechMap,
    getSlots,
    appointments,
    date
  );

  const forms = assignedTechs.length === appointments.length
    ? appointments.map((appt, idx) => ({
      date,
      time: commonSlots?.[0] ? formatTime(commonSlots[0]) : "",
      technician: { id: assignedTechs[idx].id, name: assignedTechs[idx].name },
      services: appt
    }))
    : [];

  console.log("Appointments (services grouped):", appointments);
  console.log("Assigned Technicians:", assignedTechs);

  return { forms, times: commonSlots || [] };
};

export {
  assignTechnicians,
  fetchAvailability
}