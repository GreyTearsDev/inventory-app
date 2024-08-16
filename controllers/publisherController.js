const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

// List all currently available publishers
exports.publisher_list = asyncHandler(async (req, res, next) => {
  const allPublishers = await db.getAllFromTable("publishers"); // Fetch all publishers from the database
  res.render("publisher_list", {
    title: "Publishers",
    publisher_list: allPublishers,
  }); // Render the publisher list view
});

// Display details for a specific publisher
exports.publisher_detail = asyncHandler(async (req, res, next) => {
  const publisherId = req.params.id;
  const [publisher, comicsFromPublisher] = await Promise.all([
    db.getSingleFromTable("publishers", publisherId), // Fetch publisher details
    db.getPublisherComics(publisherId), // Fetch comics from the publisher
  ]);

  if (!publisher) {
    // Handle case where publisher is not found
    const err = new Error("Publisher not found");
    err.status = 404;
    return next(err);
  }

  res.render("publisher_detail", {
    title: publisher.name,
    publisher: publisher,
    comic_list: comicsFromPublisher,
  });
});

// Display form for creating a new publisher
exports.publisher_create_get = (req, res, next) => {
  res.render("publisher_form", {
    title: "Create new publisher",
    publisher: undefined,
    errors: [],
  });
};

// Handle form submission for creating a new publisher
exports.publisher_create_post = [
  body("name", "Publisher's name field must be filled")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("headquarters").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req); // Validate request body
    const publisher = {
      name: req.body.name,
      headquarters: req.body.headquarters,
    };

    if (!errors.isEmpty()) {
      // Handle validation errors
      res.render("publisher_form", {
        title: "Create new publisher",
        publisher: undefined,
        errors: errors.array(),
      });
      return;
    }

    // Check if the publisher already exists
    const existingPublisher = await db.getPublisherByName(publisher.name);

    if (existingPublisher) {
      // Redirect if publisher already exists
      res.redirect(existingPublisher.url);
      return;
    }

    await db.savePublisher(publisher); // Save new publisher to the database
    const createdPublisher = await db.getPublisherByName(publisher.name);
    res.redirect(createdPublisher.url);
  }),
];

// Display form for updating an existing publisher's information
exports.publisher_update_get = asyncHandler(async (req, res, next) => {
  const publisherId = req.params.id;
  const publisher = await db.getSingleFromTable("publishers", publisherId);

  if (!publisher) {
    // Handle case where publisher is not found
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

// Handle form submission for updating an existing publisher
exports.publisher_update_post = [
  body("name", "Publisher's name field must be filled")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("headquarters").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req); // Validate request body
    const publisherId = req.params.id;

    const publisher = {
      name: req.body.name,
      headquarters: req.body.headquarters,
    };

    if (!errors.isEmpty()) {
      // Handle validation errors
      res.render("publisher_form", {
        title: "Update publisher info",
        publisher: publisher,
        errors: errors.array(),
      });
      return;
    }

    // Check if the publisher with the same name and headquarters already exists
    const existingPublisher = await db.getSingleFromTable(
      "publishers",
      publisherId,
    );

    if (
      existingPublisher &&
      existingPublisher.name === publisher.name &&
      existingPublisher.headquarters === publisher.headquarters
    ) {
      res.redirect(existingPublisher.url);
      return;
    }

    await db.updatePublisher(publisherId, publisher); // Update publisher in the database
    const updatedPublisher = await db.getPublisherByName(publisher.name);
    res.redirect(updatedPublisher.url);
  }),
];

// Display form for confirming publisher deletion
exports.publisher_delete_get = asyncHandler(async (req, res, next) => {
  const publisherId = req.params.id;
  const [publisher, comicsFromPublisher] = await Promise.all([
    db.getSingleFromTable("publishers", publisherId), // Fetch publisher details
    db.getPublisherComics(publisherId), // Fetch comics from the publisher
  ]);

  if (!publisher) {
    // Handle case where publisher is not found
    const err = new Error("Publisher not found");
    err.status = 404;
    return next(err);
  }

  res.render("publisher_delete", {
    title: "Delete publisher",
    publisher: publisher,
    comic_list: comicsFromPublisher,
  });
});

// Handle form submission for deleting a publisher
exports.publisher_delete_post = asyncHandler(async (req, res, next) => {
  const publisherId = req.body.publisherid;
  const publisher = await db.getSingleFromTable("publishers", publisherId);

  if (!publisher) {
    // Handle case where publisher is not found
    const err = new Error("Publisher not found");
    err.status = 404;
    return next(err);
  }

  await db.deletePublisher(publisherId); // Delete publisher from the database
  res.redirect("/catalog/publishers"); // Redirect to publishers list
});
