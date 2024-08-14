const { DateTime } = require("luxon");

/**
 * Formats a JavaScript Date object into a string with the format "dd-MM-yyyy".
 *
 * @param {Date} date - The date to format.
 * @returns {string} - A string representing the date in "dd-MM-yyyy" format. If the date is null or undefined, returns an empty string.
 *
 * @example
 * // Example usage
 * format(new Date(2024, 7, 14)); // returns "14-08-2024"
 */
const format = (date) => {
  return date ? DateTime.fromJSDate(date).toFormat("dd-MM-yyyy") : "";
};

/**
 * Converts a date string in "dd-MM-yyyy" format to a string in "yyyy-MM-dd" format.
 *
 * @param {string} date - The date string to convert, expected in "dd-MM-yyyy" format.
 * @returns {string} - A string representing the date in "yyyy-MM-dd" format. If the input date string is null or undefined, returns an empty string.
 *
 * @example
 * // Example usage
 * format_dash("14-08-2024"); // returns "2024-08-14"
 */
const format_dash = (date) => {
  if (!date) return "";
  console.log("inside", date);

  const [day, month, year] = date.split("-");
  return `${year}-${month}-${day}`;
};

module.exports = {
  format,
  format_dash,
};
