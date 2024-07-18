const Publisher = require("../models/publisher");
const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");

// List all currently available publishers
exports.publisher_list = asyncHandler(async (req, res, next) => {
  const allPublishers = await Publisher.find().sort({ name: 1 }).exec();

  res.render("publisher_list", {
    title: "Publishers",
    publisher_list: allPublishers,
  });
});

exports.publisher_detail = asyncHandler(async (req, res, next) => {
  const [publisher, comicsFromPublisher] = await Promise.all([
    Publisher.findById(req.params.id).exec(),
    Comic.find({ publisher: req.params.id }, "title").sort({ title: 1 }).exec(),
  ]);

  if (!publisher) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  res.render("publisher_detail", {
    title: `Publisher details (${publisher.name})`,
    publisher: publisher,
    comic_list: comicsFromPublisher,
  });
});
