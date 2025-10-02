import AppointmentService from "../services/appointmentService";
import TechnicianService from "../services/technicianService";
import {
  formatTime,
  getBusinessHours,
  distributeItems,
  getCommonAvailableSlots
} from "./helper";

/**
 * Executes a backtracking search to assign unique, compatible technicians to a list of
 * concurrent appointments and finds the set of maximum overlapping time slots available
 * for all assigned technicians.
 *
 * This function uses a recursive search to try all unique technician assignments for the
 * concurrent appointment groups. It prioritizes the best assignment (one with the most
 * available slots) where all assigned technicians are *real* (i.e., not "No Preference"),
 * before falling back to the best overall assignment.
 *
 * @param {Array<Array<Technician>>} appointmentTechMap - An array where each element is a list
 * of all compatible technicians for the corresponding concurrent appointment group.
 * @param {Array<Array<Service>>} appointments - The grouped services (concurrent appointments),
 * used by the slot calculation helper (`getCommonAvailableSlots`) to determine duration.
 * @param {Date} date - The date to check for schedule availability.
 * @returns {Promise<{assignedTechs: Technician[], commonSlots: string[]}>} A promise that
 * resolves to the best found assignment of technicians and their common available time slots.
 */
const assignTechnicians = async (appointmentTechMap, appointments, date) => {
  let bestAllReal = null;
  let bestAny = { assignedTechs: [], commonSlots: [] };

  const allSchedulesResponse = await TechnicianService.getScheduleByDate(date);
  const schedulesMap = new Map(
    allSchedulesResponse.data.map(tech => [tech.id, tech.Appointments || []])
  );

  const backtrack = async (idx, current, usedTechs) => {
    if (idx === appointmentTechMap.length) {
      const slots = await getCommonAvailableSlots(current, appointments, date, schedulesMap);
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
 * Calculates the booking availability and technician assignments for a group of services
 * on a specific date, attempting to find a single, common time slot.
 *
 * This process involves:
 * 1. Flattening the requested services based on quantity.
 * 2. Grouping the flattened services into concurrent 'appointments' based on the `groupSize`.
 * 3. For each concurrent appointment, finding all technicians who can perform the required service categories.
 * 4. Using an external service (`assignTechnicians`) to assign a specific technician to each appointment
 * and determine the common available time slots on the given date.
 * 5. Constructing structured booking forms based on the successful assignments and common slots.
 *
 * @param {Date|null} date - The target date for the booking.
 * @param {Service[]} selectedServices - An array of services requested, including their requested quantities.
 * @param {number} groupSize - The maximum number of concurrent services/appointments that can be handled simultaneously (e.g., number of treatment rooms or staff available).
 * @returns {Promise<AvailabilityResult>} A promise that resolves to an object containing structured booking forms and the common available time slots.
 */
const fetchAvailability = async (date, selectedServices, groupSize) => {
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

  const { assignedTechs, commonSlots } = await exports.assignTechnicians(
    appointmentTechMap,
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