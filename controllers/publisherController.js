const Publisher = require("../models/publisher");
const asyncHandler = require("express-async-handler");

exports.publisher_list = asyncHandler(async (req, res, next) => {
  const allPublishers = await Publisher.find().sort({ name: 1 }).exec();

  res.render("publisher_list", {
    title: "Publishers",
    publisher_list: allPublishers,
  });
});
