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
 * Calculates available time slots for appointments based on the selected date, business hours, and technician availability.
 * Takes into account technician-specific unavailability dates.
 * 
 * @param {Array} appointments - A list of existing appointments. Each appointment should have a `date`, `start_service_time`, and `Services` array.
 * @param {Array} selectedServices - An array of selected services for the appointment, where each service should have a `time` (duration) in minutes.
 * @param {string} selectedDate - The date for which available slots are to be calculated, formatted as "YYYY-MM-DD".
 * @param {Object} businessHours - An object containing `start` and `end` properties representing the business's opening and closing hours in 24-hour format.
 * @param {Object} technician - The technician object containing information about their name and unavailability. It has a `name` property and `unavailability` property for custom date ranges.
 * 
 * @returns {Array} - An array of available time slots, represented as `Date` objects. Each slot is 30 minutes long and can fit the selected services.
 * 
 * @example
 * const appointments = [
 *   { date: "2025-01-24", start_service_time: "10:00", Services: [{ time: 60 }] },
 *   { date: "2025-01-24", start_service_time: "11:30", Services: [{ time: 30 }] }
 * ];
 * const selectedServices = [{ time: 60 }];
 * const selectedDate = "2025-01-24";
 * const businessHours = { start: 9, end: 17 };
 * const technician = { name: "Lisa", unavailability: "" }; // Custom unavailability dates based on name
 * 
 * const availableSlots = calculateAvailableSlots(appointments, selectedServices, selectedDate, businessHours, technician);
 * console.log(availableSlots);
 */
const calculateAvailableSlots = (
  appointments,
  selectedServices,
  selectedDate,
  businessHours,
  technician
) => {
  const occupiedSlots = [];
  console.log(`businessHours`);
  console.log(businessHours);


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
 * Retrieves the business hours for a given day or defaults to a standard time range if no specific hours are found.
 * 
 * This function first tries to fetch the business hours for a specified day (e.g., "sunday"). If the hours for that 
 * day are not found or the format is invalid, it falls back to the default business hours, which are 9 AM to 7 PM. 
 * If no specific business hours are available for the day or fallback data, the default business hours are used.
 * 
 * The expected format for the business hours is a string in the form of "start,end" (e.g., "9,17").
 * 
 * @async
 * @function business_hours
 * @param {string} [day] - The specific day for which to fetch the business hours (e.g., "sunday"). If no day is provided, the function will fetch general business hours.
 * @returns {Promise<{start: number, end: number}>} A promise that resolves to an object containing the start and end hours in a 24-hour format. The default is `{ start: 9, end: 19 }` if no valid hours are found.
 * @throws {Error} If there is an error during the process of retrieving or parsing the business hours.
 */
const business_hours = async (day) => {
  const defaultHours = { start: 9, end: 19 };
  try {
    const dayKey = day ? `${day}_hours` : null;
    const result = dayKey ? await MiscellaneousService.find(dayKey) : null;

    if (result) {
      const context = result.data.context;

      // Check if the context is a valid string of the form "start,end"
      if (context && context.includes(",")) {
        const hours = context.split(",").map(hour => parseInt(hour.trim()));

        // Ensure both start and end hours are valid numbers
        if (hours.length === 2 && !isNaN(hours[0]) && !isNaN(hours[1])) {
          return { start: hours[0], end: hours[1] };
        }
      }

      // Fallback to default if parsing fails
      console.warn("Invalid business hours format. Using default hours.");
      return defaultHours;
    }

    // Fallback to default business hours if no result
    const fallbackResult = await MiscellaneousService.find("business_hours");

    if (fallbackResult) {
      const context = fallbackResult.data.context;

      // Same parsing logic for fallback result
      if (context && context.includes(",")) {
        const hours = context.split(",").map(hour => parseInt(hour.trim()));
        if (hours.length === 2 && !isNaN(hours[0]) && !isNaN(hours[1])) {
          return { start: hours[0], end: hours[1] };
        }
      }

      // Fallback to default if parsing fails
      console.warn("Invalid fallback business hours format. Using default hours.");
      return defaultHours;
    }

    return defaultHours;
  } catch (error) {
    console.error("Failed to parse business hours:", error);
    return defaultHours;
  }
};


/**
 * Converts a 24-hour format hour to a 12-hour format.
 * 
 * @param {number} hour - The hour in 24-hour format (0-23).
 * @returns {number} The corresponding hour in 12-hour format (1-12).
 * 
 * @example
 * console.log(convertTo12Hour(0));  // 12
 * console.log(convertTo12Hour(12)); // 12
 * console.log(convertTo12Hour(13)); // 1
 * console.log(convertTo12Hour(23)); // 11
 */
const convertTo12Hour = (hour) => {
  if (!hour) {
    return;
  }
  return (hour % 12) || 12;
}










export { formatPrice, calculateTotalTime, calculateTotalAmount, calculateAvailableSlots, waTimeString, now, calculateTotalTimePerAppointment, business_hours, convertTo12Hour };
