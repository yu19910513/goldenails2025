import AppointmentService from "../services/appointmentService";
import { calculateAvailableSlots, groupServicesByCategory, getBusinessHours } from "./helper";

/**
 * Intersect available time slots across multiple technicians and their appointments
 * @param {Array} assignedTechs - Array of technicians (may contain nulls)
 * @param {Array} appointments - Corresponding appointments (array of services)
 * @param {string} customerDate - Date string (YYYY-MM-DD)
 * @returns {Array} Array of available Date objects
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

export {
    getCommonAvailableSlots
}