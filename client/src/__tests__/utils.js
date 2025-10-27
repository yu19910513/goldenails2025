/**
 * Adds a number of days to a date string.
 *
 * @param {string} dateString - The start date in "YYYY-MM-DD" format.
 * @param {number} daysToAdd - The number of days to add.
 * @returns {string} The new date in "YYYY-MM-DD" format.
 */
export const addDaysToDate = (dateString, daysToAdd) => {
    // Parse the date string as local time to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    // Month is 0-indexed in JavaScript (0=Jan, 11=Dec)
    const date = new Date(year, month - 1, day);

    // Set the date to the new day
    date.setDate(date.getDate() + daysToAdd);

    // Format the output back to "YYYY-MM-DD"
    const newYear = date.getFullYear();
    const newMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const newDay = date.getDate().toString().padStart(2, '0');

    return `${newYear}-${newMonth}-${newDay}`;
};