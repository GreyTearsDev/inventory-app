const Publisher = require("../models/publisher");
const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

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

exports.publisher_create_get = (req, res, next) => {
  res.render("publisher_form", {
    title: "Create new publisher",
    publisher: undefined,
    errors: [],
  });
};

exports.publisher_create_post = [
  body("name", "Publisher's name field must be filled")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("headquarters").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const publisher = new Publisher({
      name: req.body.name,
      headquarters: req.body.headquarters,
    });

    if (!errors.isEmpty) {
      res.render("publisher_form", {
        title: "Create new publisher",
        publisher: undefined,
        errors: errors.array(),
      });
      return;
    }
    // check if publisher already exists
    const existingPublisher = await Publisher.findOne({
      name: req.body.name,
    })
      .collation({ locale: "en", strength: 2 })
      .exec();

    if (
      existingPublisher &&
      existingPublisher.headquarters === req.body.headquarters
    ) {
      res.redirect(existingPublisher.url);
      return;
    }
    await publisher.save();
    res.redirect(publisher.url);
  }),
];

exports.publisher_update_get = asyncHandler(async (req, res, next) => {
  const publisher = await Publisher.findById(req.params.id).exec();

  if (!publisher) {
    const err = new Error("Publisher not found");
    err.status = 404;
    return next(err);
  }

  res.render("publisher_form", {
    title: "Update publisher info",
    publisher: publisher,
    errors: [],
  });
});

exports.publisher_update_post = [
  body("name", "Publisher's name field must be filled")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("headquarters").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const publisher = new Publisher({
      name: req.body.name,
      headquarters: req.body.headquarters,
      _id: req.params.id,
    });

    if (!errors.isEmpty) {
      res.render("publisher_form", {
        title: "Update publisher info",
        publisher: publisher,
        errors: errors.array(),
      });
      return;
    }

    // check if publisher already exists
    const existingPublisher = await Publisher.findOne({
      name: req.body.name,
      headquarters: req.body.headquarters,
    })
      .collation({ locale: "en", strength: 3 })
      .exec();

    if (existingPublisher) {
      res.redirect(existingPublisher.url);
    } else {
      await Publisher.findByIdAndUpdate(req.params.id, publisher, {});
      res.redirect(publisher.url);
    }
  }),
];
