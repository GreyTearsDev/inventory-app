const { DateTime } = require("luxon");

const format = (date) => {
  return date ? DateTime.fromJSDate(date).toFormat("dd-MM-yyyy") : "";
};

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
