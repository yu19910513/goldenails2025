import NotificationService from "../services/notificationService";
import { DateTime } from "luxon";
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
 * Calculates available time slots for a technician on a given date, considering
 * appointments, service durations, technician unavailability, business hours, and optional buffer time.
 *
 * @param {Array<Object>} appointments - An array of existing appointments for the technician.
 * @param {Object<string, Array<{ time: number }>>} selectedServices 
 *   An object where each key is a service category ID, and the value is an array of service objects.
 *   Each service object must include a `time` field representing its duration in minutes.
 * @param {string} selectedDate - The selected date in `YYYY-MM-DD` format.
 * @param {{ start: number, end: number }} businessHours - Object defining start and end business hours (24-hour format).
 * @param {{ name: string, unavailability: string }} technician - The technician object. `unavailability` can be a comma-separated string of weekday indices (0–6).
 * @param {number} [bufferTimeHours=0] - Optional buffer time (in hours) that restricts today's bookings before the buffer window.
 *
 * @returns {Array<Date>} - Array of available slot start times as Date objects.
 *
 * @throws {Error} - May throw if service data is malformed or if dates are invalid.
 *
 * @example
 * const slots = calculateAvailableSlots(
 *   [{ date: "2025-03-01", start_service_time: "10:00", Services: [{ time: 60 }] }],
 *   {
 *     "1": [{ time: 30 }, { time: 60 }],
 *     "2": [{ time: 45 }]
 *   },
 *   "2025-03-02",
 *   { start: 9, end: 17 },
 *   { name: "Tracy", unavailability: "0,6" },
 *   2
 * );
 * // => [Date, Date, ...]
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
 * Returns the current date/time in America/Los_Angeles time zone as a JavaScript Date.
 *
 * @returns {Date}
 */
const now = () => {
  return DateTime.now().setZone('America/Los_Angeles').toJSDate();
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

    await new Promise((resolve) => {
      // Simulate async behavior (like sending an SMS or email)
      NotificationService.notify(messageData);  // Assuming it's async
      resolve();  // Resolve immediately after calling the notify method
    });
    console.log("Cancellation SMS sent successfully");
  } catch (error) {
    console.error("Failed to send cancellation SMS:", error);
  }
};

/**
 * Groups an array of service objects by their category ID.
 *
 * This function is primarily used to convert a flat list of selected services
 * into the grouped format required by the `calculateAvailableSlots` function,
 * where each key is a category ID and the value is an array of service objects
 * belonging to that category.
 *
 * @param {Array<Object>} services - An array of service objects, each expected to have a `category_id` property.
 * @returns {Object<string, Array<Object>>} An object mapping category IDs to arrays of services.
 *
 * @throws {Error} If the input is not an array.
 *
 * @example
 * const selectedServices = [
 *   { id: 1, category_id: "nails", time: 30 },
 *   { id: 2, category_id: "nails", time: 45 },
 *   { id: 3, category_id: "waxing", time: 20 }
 * ];
 *
 * const grouped = groupServicesByCategory(selectedServices);
 * // => {
 * //   nails: [{...}, {...}],
 * //   waxing: [{...}]
 * // }
 */
const groupServicesByCategory = (services) => {
  if (!Array.isArray(services)) {
    throw new Error("Input must be an array of service objects.");
  }

  return services.reduce((acc, service) => {
    const categoryId = service.category_id;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(service);
    return acc;
  }, {});
};

/**
 * Format a JavaScript Date object into a time string (HH:MM).
 *
 * Pads hours and minutes with leading zeros if necessary to ensure a 24-hour format.
 *
 * @function
 * @param {Date} dateObj - A valid JavaScript Date object.
 * @returns {string} The formatted time string in "HH:MM" 24-hour format.
 *
 * @example
 * const date = new Date("2025-01-25T09:05:00");
 * formatTime(date); // Returns "09:05"
 */
const formatTime = (dateObj) => {
  const hrs = String(dateObj.getHours()).padStart(2, "0");
  const mins = String(dateObj.getMinutes()).padStart(2, "0");
  return `${hrs}:${mins}`;
};

/**
 * Replaces all empty string ("") values in an object with null.
 *
 * @param {Object} obj - The input object to process.
 * @returns {Object} A new object with all empty string values replaced by null.
 *
 * @example
 * const input = { name: "", email: "test@example.com" };
 * const result = replaceEmptyStringsWithNull(input);
 * // result: { name: null, email: "test@example.com" }
 */
const replaceEmptyStringsWithNull = (obj) => {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = obj[key] === "" ? null : obj[key];
    return acc;
  }, {});
};

/**
 * Compares the values of all keys that exist in both the `control` and `test` objects.
 * Trims string values before comparing. Returns `true` only if all common keys have equal values.
 * Returns `false` if either object is null, not an object, empty, or if any common key's values differ.
 *
 * @param {Object|null} control - The reference object containing keys to compare.
 * @param {Object|null} test - The object being compared against the control.
 * @returns {boolean} `true` if all common keys have equal (trimmed) values, `false` otherwise.
 *
 * @example
 * const control = { name: " Alice ", phone: "123" };
 * const test = { name: "Alice", phone: "123", extra: "ignore me" };
 * areCommonValuesEqual(control, test); // true
 *
 * @example
 * const control = { name: "Alice", phone: "123" };
 * const test = { name: "Bob", phone: "123" };
 * areCommonValuesEqual(control, test); // false
 */
const areCommonValuesEqual = (control, test) => {
  if (
    !control || !test ||
    typeof control !== 'object' || typeof test !== 'object' ||
    Object.keys(control).length === 0 ||
    Object.keys(test).length === 0
  ) {
    return false;
  }

  for (const key of Object.keys(control)) {
    if (key in test) {
      const controlVal = typeof control[key] === "string" ? control[key].trim() : control[key];
      const testVal = typeof test[key] === "string" ? test[key].trim() : test[key];

      if (controlVal !== testVal) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Returns business hours for a given date, using America/Los_Angeles time zone.
 * 
 * - On Sundays, returns { start: 11, end: 17 }
 * - On other days, returns { start: 9, end: 19 }
 *
 * @param {string} dateInput - An ISO 8601 date string (e.g., "2025-05-04").
 * @returns {{ start: number, end: number }} An object representing opening and closing hours.
 */
const getBusinessHours = (dateInput) => {
  const dt = DateTime.fromISO(dateInput, { zone: "America/Los_Angeles" });
  const isSunday = dt.weekday === 7; // Luxon: 1 = Monday, ..., 7 = Sunday

  return isSunday
    ? { start: 11, end: 17 }
    : { start: 9, end: 19 };
}

/**
 * Sanitizes an object by trimming whitespace from all string values, 
 * converting the "name" field to uppercase, and converting the "email" field to lowercase.
 * All other fields are trimmed but remain unchanged.
 *
 * @param {Object} object - The input object containing the fields to sanitize.
 * @returns {Object} - A new object with sanitized values:
 *   - The "name" field will be trimmed and converted to uppercase.
 *   - The "email" field will be trimmed and converted to lowercase.
 *   - Other string fields will be trimmed.
 *   - Non-string fields will remain unchanged.
 * 
 * @example
 * const input = {
 *   name: "  John Doe  ",
 *   phone: " 123-456-7890 ",
 *   email: "  ExAMPLE@EMAIL.COM  ",
 *   address: "123 Main St"
 * };
 * 
 * const sanitizedInput = sanitizeObjectInput(input);
 * console.log(sanitizedInput);
 * // Output:
 * // {
 * //   name: "JOHN DOE",
 * //   phone: "123-456-7890",
 * //   email: "example@email.com",
 * //   address: "123 Main St"
 * // }
 */
const sanitizeObjectInput = (object) => {
  console.log("sanitizing the form...");
  const sanitized = {};

  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      let value = object[key];

      // If the value is a string, apply trimming, uppercasing, and lowercasing
      if (typeof value === "string") {
        if (key === "name") {
          sanitized[key] = value.trim().toUpperCase();
        } else if (key === "email") {
          sanitized[key] = value.trim().toLowerCase();
        } else {
          sanitized[key] = value.trim();
        }
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
}

/**
 * Checks if a given JWT token is valid by verifying its structure and expiration.
 * 
 * This function:
 * - Validates that the token exists and is a string.
 * - Ensures the token has three parts separated by dots (standard JWT format).
 * - Decodes the payload part of the token from base64 URL format.
 * - Parses the JSON payload and checks for a valid numeric "exp" (expiration time) field.
 * - Returns true if the token is not expired based on the current time.
 * 
 * @param {string | null | undefined} token - The JWT token to validate.
 * @returns {boolean} True if the token is a valid JWT and not expired, false otherwise.
 */
const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') {
    return false; // no token or wrong type
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false; // not a valid JWT structure
  }

  try {
    const payloadBase64 = parts[1];
    // Add padding for base64 if needed
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const payloadJson = atob(padded);
    const payload = JSON.parse(payloadJson);

    if (!payload.exp || typeof payload.exp !== 'number') {
      return false; // no expiration or invalid format
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch {
    return false; // invalid base64 or JSON parse error
  }
}

/**
 * Distribute items into groups such that:
 *  - Each group cannot contain duplicate items with the same `id`.
 *  - The total `time` values across groups are balanced as evenly as possible.
 *  - If the number of duplicates of any single `id` is greater than the given `size`,
 *    the `size` is automatically increased to fit all duplicates.
 *
 * Strategy:
 *  - For small inputs (≤ 20 items and ≤ 4 groups), an optimized backtracking
 *    approach is used to minimize the spread (difference between max and min total time).
 *  - For larger inputs, a greedy heuristic is used for efficiency.
 *
 * @param {Array<{id: string, time: number}>} items - Array of items to distribute.
 *   Each item must have a unique `id` (identifier for type) and `time` (duration in minutes).
 *   Duplicate objects with the same `id` represent repeated instances of that type.
 * @param {number} size - Number of groups to distribute items into.
 *   Will be auto-increased if fewer than the maximum number of duplicates of any id.
 * @returns {Array<Array<{id: string, time: number}>>} 
 *   Array of groups, each group being an array of items.
 *
 * @example
 * const items = [
 *   { id: "A", time: 40 },
 *   { id: "A", time: 40 },
 *   { id: "B", time: 20 },
 *   { id: "C", time: 10 },
 *   { id: "F", time: 1 },
 *   { id: "F", time: 1 },
 * ];
 *
 * // With size = 2, auto-increases to 2 (since max duplicate count is 2 for A and F).
 * const groups = distributeItems(items, 2);
 *
 * // Possible output (balanced by time):
 * // [
 * //   [ { id: "A", time: 40 }, { id: "C", time: 10 }, { id: "F", time: 1 } ],
 * //   [ { id: "A", time: 40 }, { id: "B", time: 20 }, { id: "F", time: 1 } ]
 * // ]
 */
const distributeItems = (items, size) => {
  // --- Adjust size automatically if duplicates exceed group size ---
  const idCounts = items.reduce((acc, item) => {
    acc[item.id] = (acc[item.id] || 0) + 1;
    return acc;
  }, {});
  const maxDuplicates = Math.max(...Object.values(idCounts), 0);

  if (size < maxDuplicates) {
    size = maxDuplicates; // bump size up to fit all duplicates
  }

  // ---- Greedy fallback ----
  const greedyDistribute = (items, size) => {
    const groups = Array.from({ length: size }, () => ({
      items: [],
      totalTime: 0,
      ids: new Set()
    }));

    // Sort by descending time
    const sorted = [...items].sort((a, b) => b.time - a.time);

    for (const item of sorted) {
      // Pick group with lowest totalTime that doesn’t have this id
      let target = null;
      let minTime = Infinity;

      for (const group of groups) {
        if (!group.ids.has(item.id) && group.totalTime < minTime) {
          minTime = group.totalTime;
          target = group;
        }
      }

      if (target) {
        target.items.push(item);
        target.totalTime += item.time;
        target.ids.add(item.id);
      }
    }

    return groups.map(g => g.items);
  };

  // ---- Optimized Backtracking ----
  const backtrackingDistribute = (items, size) => {
    const groups = Array.from({ length: size }, () => ({
      items: [],
      totalTime: 0,
      ids: new Set()
    }));

    const sorted = [...items].sort((a, b) => b.time - a.time);

    let bestSolution = null;
    let bestSpread = Infinity;

    const backtrack = (index) => {
      if (index === sorted.length) {
        const times = groups.map(g => g.totalTime);
        const spread = Math.max(...times) - Math.min(...times);
        if (spread < bestSpread) {
          bestSpread = spread;
          bestSolution = groups.map(g => g.items.slice());
        }
        return;
      }

      const item = sorted[index];
      for (const group of groups) {
        if (group.ids.has(item.id)) continue;

        // Place
        group.items.push(item);
        group.totalTime += item.time;
        group.ids.add(item.id);

        const times = groups.map(g => g.totalTime);
        const spread = Math.max(...times) - Math.min(...times);

        if (spread <= bestSpread) {
          backtrack(index + 1);
        }

        // Undo
        group.items.pop();
        group.totalTime -= item.time;
        group.ids.delete(item.id);
      }
    };

    backtrack(0);
    return bestSolution;
  };

  // ---- Choose strategy ----
  if (items.length <= 20 && size <= 4) {
    return backtrackingDistribute(items, size);
  } else {
    return greedyDistribute(items, size);
  }
};

/**
 * Assign technicians to appointments
 * @param {Array[]} appointmentTechMap - Array of arrays of available techs per appointment
 * @returns {Array} assignedTechs - Array of assigned technician objects or null
 */
const assignTechnicians = (appointmentTechMap) => {
  const assignedTechs = [];
  const usedTechs = new Set();

  for (const techOptions of appointmentTechMap) {
    // Prefer a tech that is not "No Preference" and hasn't been used
    let assigned = techOptions.find(t => t.name !== "No Preference" && !usedTechs.has(t.name));

    // If none, fallback to "No Preference"
    if (!assigned) assigned = techOptions.find(t => t.name === "No Preference");

    if (assigned) {
      assignedTechs.push(assigned);
      if (assigned.name !== "No Preference") usedTechs.add(assigned.name);
    } else {
      assignedTechs.push(null); // no tech available
    }
  }

  return assignedTechs;
};





export {
  formatPrice,
  calculateTotalTime,
  calculateTotalAmount,
  calculateAvailableSlots,
  waTimeString,
  now,
  calculateTotalTimePerAppointment,
  sendCancellationNotification,
  groupServicesByCategory,
  formatTime,
  replaceEmptyStringsWithNull,
  areCommonValuesEqual,
  getBusinessHours,
  sanitizeObjectInput,
  isTokenValid,
  distributeItems,
  assignTechnicians
};
