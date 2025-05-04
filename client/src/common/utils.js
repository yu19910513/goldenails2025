import NotificationService from "../services/notificationService";
import MiscellaneousService from "../services/miscellaneousService";
/**
 * Formats a price into a string based on specific conditions:
 * - If the price ends with 1, 6, or 9 and less than 1000, it subtracts 1 and appends a "+".
 * - If the price is 1000 or more, it splits the price into a range format.
 * - Otherwise, it returns the price as a standard dollar amount.
 * 
 * @param {number} price - The price to format.
 * @returns {string} - The formatted price string.
 * @throws {Error} - Throws if the input price is not a number.
 * 
 * @example
 * formatPrice(156); // "$155+"
 * formatPrice(1020); // "$10 - 20"
 * formatPrice(50); // "$50"
 */
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    throw new Error("Invalid price value. It must be a number.");
  }

  if (price >= 1000) {
    const low = Math.floor(price / 100);
    const high = price % 100;
    return `$${low} - ${high}`;
  }

  if (price % 10 === 1 || price % 10 === 6 || price % 10 === 9) {
    return `$${price - 1}+`;
  }

  return `$${price}`;
};

/**
 * Calculates the total time required for all selected services.
 * 
 * @param {Object} selectedServices - An object where keys are category IDs and values are arrays of service objects.
 * @param {Array<Object>} selectedServices[categoryId] - The array of service objects in a category.
 * @param {number} selectedServices[categoryId].time - The time required for each service.
 * @returns {number} - The total time required for all selected services.
 * @throws {Error} - Throws if `selectedServices` is not an object or if services are not arrays.
 * 
 * @example
 * const selectedServices = {
 *   1: [
 *     { id: 52, name: "Essential Manicure", time: 1 },
 *     { id: 53, name: "Gel Essential Manicure", time: 1 },
 *   ],
 *   2: [{ id: 60, name: "Spa Pedicure", time: 2 }],
 * };
 * calculateTotalTime(selectedServices); // 4
 */
const calculateTotalTime = (selectedServices) => {
  console.log(selectedServices);

  if (typeof selectedServices !== 'object' || selectedServices === null) {
    throw new Error("Invalid input. `selectedServices` must be an object.");
  }

  let totalTime = 0;

  for (const categoryId in selectedServices) {
    if (selectedServices.hasOwnProperty(categoryId)) {
      const services = selectedServices[categoryId];

      if (!Array.isArray(services)) {
        throw new Error(`Invalid services list for category ${categoryId}. Expected an array.`);
      }

      totalTime += services.reduce((sum, service) => sum + (service.time || 0), 0);
    }
  }
  return totalTime;
};

/**
 * Calculates the total time for an appointment based on its services.
 *
 * @param {Array} services - An array of service objects. Each object is expected to have a `time` property that represents the time required for the service in minutes.
 * @returns {number} The total time of all services combined, in minutes.
 *
 * @example
 * const services = [
 *   { id: 1, name: "Manicure", time: 30 },
 *   { id: 2, name: "Pedicure", time: 45 },
 * ];
 * const totalTime = calculateTotalTimePerAppointment(services); // Returns 75
 */
const calculateTotalTimePerAppointment = (services) => {
  return services.reduce((total, service) => total + service.time, 0);
};


/**
 * Calculates the total amount for selected services.
 * 
 * The function iterates over the `selectedServices` object, which is expected to have
 * categories as keys and an array of service objects as values. Each service object should
 * have a `price` property. The total price of all services is summed and returned.
 * 
 * @param {Object} selectedServices - An object where keys are category IDs and values are arrays of service objects.
 * Each service object should contain a `price` property representing the service's cost.
 * @throws {Error} Will throw an error if `selectedServices` is not an object or if any service list is not an array.
 * @throws {Error} Will throw an error if a service object does not have a valid `price` property.
 * 
 * @returns {number} The total amount of all selected services.
 */
const calculateTotalAmount = (selectedServices) => {
  if (typeof selectedServices !== 'object' || selectedServices === null) {
    throw new Error("Invalid input. `selectedServices` must be an object.");
  }

  let totalAmount = 0;

  for (const categoryId in selectedServices) {
    if (selectedServices.hasOwnProperty(categoryId)) {
      const services = selectedServices[categoryId];

      if (!Array.isArray(services)) {
        throw new Error(`Invalid services list for category ${categoryId}. Expected an array.`);
      }

      totalAmount += services.reduce((sum, service) => sum + (service.price || 0), 0);
    }
  }
  return totalAmount;
}

/**
 * Calculates available booking slots for a technician on a given date,
 * considering existing appointments, service durations, business hours,
 * technician unavailability, and optional buffer time (for today only).
 *
 * @param {Array<Object>} appointments - Existing appointments. Each object should include:
 *   - date {string} (format: "YYYY-MM-DD")
 *   - start_service_time {string} (format: "HH:mm")
 *   - Services {Array<{ time: number }>} (duration in minutes)
 *
 * @param {Object} selectedServices - An object mapping technician/service IDs to arrays of service objects,
 *   each with a `time` field in minutes.
 *
 * @param {string} selectedDate - The date to check availability for (format: "YYYY-MM-DD").
 *
 * @param {{ start: number, end: number }} businessHours - Business operating hours in 24-hour format.
 *   For example: { start: 9, end: 17 }.
 *
 * @param {{ name: string, unavailability?: string }} technician - Technician's name and optional
 *   unavailability string. This can include comma-separated weekday indices (0=Sunday, ..., 6=Saturday).
 *
 * @param {number} [bufferTimeHours=0] - Optional buffer time in hours, applied only if `selectedDate` is today.
 *   Slots before the current time plus this buffer are excluded.
 *
 * @returns {Date[]} An array of available `Date` objects representing valid booking slot start times.
 *
 * @example
 * const slots = calculateAvailableSlots(appointments, selectedServices, "2025-05-03", { start: 9, end: 17 }, technician, 2);
 * // Returns all available 30-minute slots starting after now + 2 hours (if today)
 */
const calculateAvailableSlots = (
  appointments,
  selectedServices,
  selectedDate,
  businessHours,
  technician,
  bufferTimeHours = 0
) => {
  const occupiedSlots = [];

  const unavailabilityRanges = {
    Lisa: { start: "2025-02-21", end: "2025-03-15" },
    Jenny: { start: "2025-02-03", end: "2025-03-17" }
  };

  const unavailableRange = unavailabilityRanges[technician.name];
  if (unavailableRange) {
    const unavailableStart = new Date(unavailableRange.start);
    const unavailableEnd = new Date(unavailableRange.end);

    const selectedDateObj = new Date(selectedDate);
    if (selectedDateObj >= unavailableStart && selectedDateObj <= unavailableEnd) {
      return []; // Return no slots if selected date is in the technician's unavailability range
    }
  }
  // Parse the technician's unavailability into a set of unavailable weekdays (0=Sunday, 6=Saturday)
  const unavailableDays = (technician.unavailability || "")
    .split(",")
    .map(day => day.trim()) // Remove spaces
    .filter(day => day !== "") // Remove empty values
    .map(Number)
    .filter(day => !isNaN(day) && day >= 0 && day <= 6);
  const selectedWeekday = (new Date(selectedDate).getDay() + 1) % 7;

  if (appointments.length === 0) {
    console.log("No appointments found.");
  } else {
    const filteredAppointments = appointments.filter(
      (appointment) =>
        new Date(appointment.date).toISOString().split("T")[0] === selectedDate
    );

    filteredAppointments.forEach((appointment) => {
      const { start_service_time, Services } = appointment;

      const duration = Array.isArray(Services)
        ? Services.reduce((total, service) => {
          const time = Number(service.time) || 0;
          return total + time;
        }, 0)
        : 0;

      const startTime = new Date(`${selectedDate}T${start_service_time}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      occupiedSlots.push({ startTime, endTime });
    });
  }

  const [year, month, day] = selectedDate.split("-");
  const startOfDay = new Date(year, month - 1, day, businessHours.start, 0, 0);
  const endOfDay = new Date(year, month - 1, day, businessHours.end, 0, 0);

  let slots = [];
  const selectedServicesDuration = calculateTotalTime(selectedServices);
  const currentTime = new Date();

  for (
    let slotStart = startOfDay;
    slotStart <= endOfDay;
    slotStart = new Date(slotStart.getTime() + 30 * 60000)
  ) {
    const slotEnd = new Date(slotStart.getTime() + selectedServicesDuration * 60000);

    if (slotEnd > endOfDay) break;

    const bufferTime = new Date(currentTime.getTime() + bufferTimeHours * 60 * 60000);
    if (slotStart < bufferTime) continue;

    const isAvailable = !occupiedSlots.some(
      (occupied) =>
        (slotStart >= occupied.startTime && slotStart < occupied.endTime) ||
        (slotEnd > occupied.startTime && slotEnd <= occupied.endTime) ||
        (slotStart < occupied.endTime && slotEnd > occupied.startTime)
    );

    if (isAvailable) {
      slots.push(slotStart);
    }
  }
  // If the selected date's weekday is in the unavailable days, return no slots
  if (unavailableDays.includes(selectedWeekday)) {
    slots = [];
  }

  return slots;
};

/**
 * Converts a given date object to a string in Washington State (Pacific Time) timezone.
 *
 * @param {Date} slotObject - The date object to be converted.
 * @returns {string} - The formatted time string in HH:mm:ss format.
 */
const waTimeString = (slotObject) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles', // Pacific Time timezone
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  }).format(slotObject);
};

/**
 * Gets the current date and time adjusted to Pacific Time (PT).
 * 
 * The function calculates the UTC offset and adjusts the local time accordingly.
 * Pacific Standard Time (PST) is UTC-8, and Pacific Daylight Time (PDT) is UTC-7.
 * The adjustment considers the server's local time zone and ensures the returned 
 * time reflects Pacific Time.
 *
 * @returns {Date} The current date and time in Pacific Time.
 */
const now = () => {
  const now = new Date();
  const offsetInHours = now.getTimezoneOffset() / 60 + 8; // Adjust UTC to Pacific Time (Standard Time: -8)
  now.setHours(now.getHours() - offsetInHours);
  return now;
}

/**
* Sends a cancellation notification to the customer and technician regarding an appointment.
* 
* This function checks that the appointment and customer details are valid. If they are, 
* it creates a message containing the necessary details and sends a cancellation 
* notification via the NotificationService. If any required details are missing or invalid, 
* it logs an error and stops further execution.
* 
* @param {Object} appointment - The appointment details for the notification.
* @param {string} appointment.date - The date of the appointment.
* @param {string} appointment.start_service_time - The start time of the appointment.
* @param {Array} appointment.Technicians - An array of technician objects assigned to the appointment.
* @param {Object} appointment.Customer - The customer details for the appointment.
* @param {string} appointment.Customer.name - The name of the customer.
* @param {string} appointment.Customer.phone - The phone number of the customer.
* @param {string} appointment.Customer.email - The email address of the customer.
* 
* @throws {Error} If there is a failure in sending the cancellation notification.
* 
* @returns {void} This function does not return a value. It sends a notification asynchronously.
*/
const sendCancellationNotification = async (appointment) => {
  try {
    if (!appointment || !appointment.date || !appointment.start_service_time || !appointment.Technicians?.length) {
      console.error("Missing or invalid appointment details.");
      return;
    }

    if (!appointment.Customer?.name || !appointment.Customer?.phone) {
      console.error("Missing customer information.");
      return;
    }

    const { name, phone, email } = appointment.Customer;
    const technicianName = appointment.Technicians[0].name;

    const messageData = {
      recipient_name: name,
      recipient_phone: phone,
      recipient_email_address: email,
      recipient_email_subject: "Cancellation",
      recipient_optInSMS: true,
      action: "cancel",
      appointment_date: appointment.date,
      appointment_start_time: appointment.start_service_time,
      appointment_technician: technicianName,
      owner_email_subject: "Cancellation Request"
    };

    await NotificationService.notify(messageData);
    console.log("Cancellation SMS sent successfully");
  } catch (error) {
    console.error("Failed to send cancellation SMS:", error);
  }
};








export { formatPrice, calculateTotalTime, calculateTotalAmount, calculateAvailableSlots, waTimeString, now, calculateTotalTimePerAppointment, sendCancellationNotification };
