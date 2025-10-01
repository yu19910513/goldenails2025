import AppointmentService from "../services/appointmentService";
import TechnicianService from "../services/technicianService";
import {
  formatTime,
  getBusinessHours,
  distributeItems,
  getCommonAvailableSlots
} from "./helper";

/**
 * Finds the optimal technician assignment for a group of appointments to maximize common availability.
 * It uses a backtracking algorithm to exhaustively search all valid combinations.
 *
 * @remarks
 * The function follows a strict set of rules for determining the "best" assignment:
 * 1.  **Core Goal:** Maximize the number of common time slots for the assigned group.
 * 2.  **Uniqueness:** A technician can only be assigned to ONE appointment within the group.
 * 3.  **Strict Preference:** It ALWAYS prioritizes a solution using only real technicians. It will
 * return the best all-real-technician assignment found, even if a different combination
 * (e.g., one with "No Preference") would yield more time slots.
 * 4.  **Fallback:** If no solution using only real technicians is possible, it falls back to the
 * best result found overall, which may include "No Preference".
 *
 * @async
 * @param {Array<Array<Object>>} appointmentTechMap - A 2D array where each inner array contains potential technicians for the appointment at that index.
 * @param {Function} getSlots - An async function to calculate common time slots for a given set of technicians.
 * @param {Array<Object>} appointments - The list of appointment objects to be assigned.
 * @param {string} date - The date for which to find the assignments (e.g., 'YYYY-MM-DD').
 * @returns {Promise<Object>} A promise resolving to the best assignment object { assignedTechs, commonSlots }, or an empty result if no solution is found.
 */
const assignTechnicians = async (appointmentTechMap, getSlots, appointments, date) => {
  let bestAllReal = null;
  let bestAny = { assignedTechs: [], commonSlots: [] };

  const allSchedulesResponse = await TechnicianService.getScheduleByDate(date);
  const schedulesMap = new Map(
    allSchedulesResponse.data.map(tech => [tech.id, tech.Appointments || []])
  );

  const backtrack = async (idx, current, usedTechs) => {
    if (idx === appointmentTechMap.length) {
      const slots = await getSlots(current, appointments, date, schedulesMap);
      const usesNoPreference = current.some(t => t.name === "No Preference");
      if (slots.length > 0) {
        if (!usesNoPreference) {
          if (!bestAllReal || slots.length > bestAllReal.commonSlots.length) {
            bestAllReal = { assignedTechs: [...current], commonSlots: slots };
          }
        }

        if (slots.length > bestAny.commonSlots.length) {
          bestAny = { assignedTechs: [...current], commonSlots: slots };
        }
      }

      return;
    }

    const techOptions = appointmentTechMap[idx] || [];

    for (const tech of techOptions.filter(t => t && t.name !== "No Preference")) {
      if (usedTechs.has(tech.name)) continue;
      usedTechs.add(tech.name);
      current.push(tech);
      await backtrack(idx + 1, current, usedTechs);
      current.pop();
      usedTechs.delete(tech.name);
    }

    for (const tech of techOptions.filter(t => t && t.name === "No Preference")) {
      if (usedTechs.has(tech.name)) continue;
      usedTechs.add(tech.name);
      current.push(tech);
      await backtrack(idx + 1, current, usedTechs);
      current.pop();
      usedTechs.delete(tech.name);
    }
  };

  await backtrack(0, [], new Set());

  if (bestAllReal) return bestAllReal;
  if (bestAny.assignedTechs.length) return bestAny;

  return { assignedTechs: [], commonSlots: [] };
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