const { DateTime } = require("luxon");

exports.format = (date) => {
  return date
    ? DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_MED)
    : "";
};
