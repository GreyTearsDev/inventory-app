const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

// List all currently available publishers
exports.publisher_list = asyncHandler(async (req, res, next) => {
  const allPublishers = await db.getAllPublishers();

  res.render("publisher_list", {
    title: "Publishers",
    publisher_list: allPublishers,
  });
});

exports.publisher_detail = asyncHandler(async (req, res, next) => {
  const publisherId = req.params.id;
  const [publisher, comicsFromPublisher] = await Promise.all([
    db.getPublisherDetails(publisherId),
    db.getComicsFromPublisher(publisherId),
  ]);

  if (!publisher) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  res.render("publisher_detail", {
    title: publisher.name,
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
    const publisher = {
      name: req.body.name,
      headquarters: req.body.headquarters,
    };

    if (!errors.isEmpty) {
      res.render("publisher_form", {
        title: "Create new publisher",
        publisher: undefined,
        errors: errors.array(),
      });
      return;
    }
    // check if publisher already exists
    const existingPublisher = await db.getPublisherByName(publisher.name);

    if (existingPublisher) {
      res.redirect(existingPublisher.url);
      return;
    }
    await db.savePublisher(publisher);
    const createdPublisher = await db.getPublisherByName(publisher.name);
    res.redirect(createdPublisher.url);
  }),
];

exports.publisher_update_get = asyncHandler(async (req, res, next) => {
  const publisherId = req.params.id;
  const publisher = await db.getPublisherDetails(publisherId);

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
    const publisherId = req.params.id;

    const publisher = {
      name: req.body.name,
      headquarters: req.body.headquarters,
    };

    if (!errors.isEmpty) {
      res.render("publisher_form", {
        title: "Update publisher info",
        publisher: publisher,
        errors: errors.array(),
      });
      return;
    }

    // check if publisher already exists
    const existingPublisher = await db.getPublisherDetails(publisherId);

    if (
      existingPublisher &&
      existingPublisher.name == publisher.name &&
      existingPublisher.headquarters == publisher.headquarters
    ) {
      res.redirect(existingPublisher.url);
      return;
    }

    await db.updatePublisher(publisherId, publisher);
    const updatedPublisher = await db.getPublisherByName(publisher.name);
    res.redirect(updatedPublisher.url);
  }),
];

exports.publisher_delete_get = asyncHandler(async (req, res, next) => {
  const publisherId = req.params.id;
  const [publisher, comicsFromPublisher] = await Promise.all([
    db.getPublisherDetails(publisherId),
    db.getComicsFromPublisher(publisherId),
  ]);

  if (!publisher) {
    const err = new Error("publisher not found");
    err.status = 404;
    return next(err);
  }

  res.render("publisher_delete", {
    title: "Delete publisher",
    publisher: publisher,
    comic_list: comicsFromPublisher,
  });
});

exports.publisher_delete_post = asyncHandler(async (req, res, next) => {
  const publisherId = req.body.publisherid;
  const publisher = await db.getPublisherDetails(publisherId);

  if (!publisher) {
    const err = new Error("publisher not found");
    err.stauts = 404;
    return next(err);
  }

  await db.deletePublisher(publisherId);
  res.redirect("/catalog/publishers");
});
