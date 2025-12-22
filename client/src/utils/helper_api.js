import TechnicianService from "../services/technicianService";
import MiscellaneousService from "../services/miscellaneousService";
import { DateTime } from "luxon";
import { formatTime, distributeItems, getCommonAvailableSlots } from "./helper";

// Fallback default buffer time in hours used when today's bufferTime is missing/invalid
const DEFAULT_BUFFER_TIME_HOURS = 2;

/**
 * Assigns unique, compatible technicians to concurrent appointments and computes common slots.
 *
 * Uses backtracking to try unique technician combinations for each concurrent appointment group.
 * Prefers assignments with only real technicians (excludes `"No Preference"`) when they yield
 * available slots; otherwise falls back to the best overall assignment.
 *
 * Notes:
 * - The input `date` is normalized with Luxon (America/Los_Angeles) to `YYYY-MM-DD`.
 * - If the normalized date is today, a `bufferTime` (in hours) is fetched from `MiscellaneousService`.
 *   When missing/invalid, a default buffer is applied. This buffer filters out early time slots.
 * - Common slots are computed via `getCommonAvailableSlots()` using the normalized date string.
 *
 * @param {Array<Array<Technician>>} appointmentTechMap - Compatible technicians per concurrent appointment.
 * @param {Array<Array<Service>>} appointments - Service groups (same indexing as `appointmentTechMap`).
 * @param {Date|string} date - Target date for schedule availability.
 * @returns {Promise<{assignedTechs: Technician[], commonSlots: Date[]}>} Best assignment and common slot start times.
 */
const assignTechnicians = async (appointmentTechMap, appointments, date) => {
  let bestAllReal = null;
  let bestAny = { assignedTechs: [], commonSlots: [] };

  const allSchedulesResponse = await TechnicianService.getScheduleByDate(date);
  const schedulesMap = new Map(
    allSchedulesResponse.data.map((tech) => [tech.id, tech.Appointments || []])
  );
  let bufferTimeHours = 0;
  const zone = "America/Los_Angeles";
  const dt = date instanceof Date
    ? DateTime.fromJSDate(date, { zone })
    : DateTime.fromISO(String(date), { zone });
  const dateString = dt.toFormat("yyyy-LL-dd");
  const isToday = dt.hasSame(DateTime.now().setZone(zone), "day");

  if (isToday) {
    try {
      const response = await MiscellaneousService.find("bufferTime");
      const raw = Number(response?.data?.context);
      if (Number.isFinite(raw) && raw > 0) {
        bufferTimeHours = Math.ceil(raw);
      } else {
        bufferTimeHours = DEFAULT_BUFFER_TIME_HOURS;
        console.warn(
          `Invalid or missing bufferTime. Using default: ${DEFAULT_BUFFER_TIME_HOURS}h`
        );
      }
    } catch (e) {
      bufferTimeHours = DEFAULT_BUFFER_TIME_HOURS;
      console.warn(
        `Failed to fetch bufferTime. Using default: ${DEFAULT_BUFFER_TIME_HOURS}h`
      );
    }
  }
  const backtrack = async (idx, current, usedTechs) => {
    if (idx === appointmentTechMap.length) {
      const slots = getCommonAvailableSlots(
        current,
        appointments,
        dateString,
        schedulesMap,
        bufferTimeHours
      );
      const usesNoPreference = current.some((t) => t.name === "No Preference");
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

    for (const tech of techOptions.filter(
      (t) => t && t.name !== "No Preference"
    )) {
      if (usedTechs.has(tech.name)) continue;
      usedTechs.add(tech.name);
      current.push(tech);
      await backtrack(idx + 1, current, usedTechs);
      current.pop();
      usedTechs.delete(tech.name);
    }

    for (const tech of techOptions.filter(
      (t) => t && t.name === "No Preference"
    )) {
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
 * Calculates booking availability and assigns technicians for a given date and service group.
 *
 * Workflow:
 * 1. Expand services by `quantity` and distribute into concurrent groups (`groupSize`).
 * 2. For each group, fetch all compatible technicians by category IDs.
 * 3. Call `assignTechnicians()` to choose one technician per group and compute common slots
 *    for the normalized date (with buffer applied when today).
 * 4. Build booking forms using the earliest common slot and the chosen technicians.
 *
 * @param {Date|string|null} date - Target booking date.
 * @param {Service[]} selectedServices - Requested services with `quantity` per item.
 * @param {number} groupSize - Max number of concurrent appointments.
 * @returns {Promise<{forms: Array<{date: Date|string, time: string, technician: {id: number|string, name: string}, services: Service[]}>, times: Date[]}>}
 *   Forms when all groups receive assignments; `times` are the common slot `Date`s.
 */
const fetchAvailability = async (date, selectedServices, groupSize) => {
  if (!date || selectedServices.length === 0) return { forms: [], times: [] };

  const servicePool = selectedServices.flatMap((s) =>
    Array(s.quantity).fill(s)
  );
  let appointments = distributeItems(servicePool, groupSize).filter(
    (a) => a.length > 0
  );
  if (appointments.length === 0) return { forms: [], times: [] };

  const appointmentTechMap = await Promise.all(
    appointments.map(async (appt) => {
      const categoryIds = [...new Set(appt.map((s) => s.category_id))];
      const res = await TechnicianService.getAvailableTechnicians(categoryIds);
      return Array.isArray(res.data) ? res.data : [];
    })
  );

  // Allow Jest spies on the exported function to intercept in tests
  const assignFn =
    typeof exports !== "undefined" && exports.assignTechnicians
      ? exports.assignTechnicians
      : assignTechnicians;

  const { assignedTechs, commonSlots } = await assignFn(
    appointmentTechMap,
    appointments,
    date
  );

  const forms =
    assignedTechs.length === appointments.length
      ? appointments.map((appt, idx) => ({
          date,
          time: commonSlots?.[0] ? formatTime(commonSlots[0]) : "",
          technician: {
            id: assignedTechs[idx].id,
            name: assignedTechs[idx].name,
          },
          services: appt,
        }))
      : [];

  console.log("Appointments (services grouped):", appointments);
  console.log("Assigned Technicians:", assignedTechs);

  return { forms, times: commonSlots || [] };
};

export { assignTechnicians, fetchAvailability };
