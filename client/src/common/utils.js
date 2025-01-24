/**
 * Formats a price into a string based on specific conditions:
 * - If the price ends with 1, 6, or 9, it subtracts 1 and appends a "+".
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

  if (price % 10 === 1 || price % 10 === 6 || price % 10 === 9) {
    return `$${price - 1}+`;
  }

  if (price >= 1000) {
    const low = Math.floor(price / 100);
    const high = price % 100;
    return `$${low} - ${high}`;
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
 * Calculates available time slots based on appointments, selected services, 
 * selected date, business hours, and technician unavailability.
 * 
 * @param {Array<Object>} appointments - List of existing appointments.
 * @param {Array<Object>} selectedServices - Selected services with their durations.
 * @param {string} selectedDate - The selected date in "YYYY-MM-DD" format.
 * @param {Object} businessHours - Object containing business start and end hours.
 * @param {string} technician_unavailability - Comma-separated string of unavailable weekdays (e.g., "0,6").
 * @returns {Array<Date>} - Array of available time slots as Date objects.
 */
const calculateAvailableSlots = (
  appointments,
  selectedServices,
  selectedDate,
  businessHours,
  technician_unavailability
) => {
  const occupiedSlots = [];

  // Parse the technician's unavailability into a set of unavailable weekdays (0=Sunday, 6=Saturday)
  const unavailableDays = technician_unavailability
    .split(",")
    .map(Number)
    .filter((day) => !isNaN(day) && day >= 0 && day <= 6);
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

    if (slotStart < currentTime) continue;

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









export { formatPrice, calculateTotalTime, calculateTotalAmount, calculateAvailableSlots };
