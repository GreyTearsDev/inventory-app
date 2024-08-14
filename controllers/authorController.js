const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

// Display list of all authors
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await db.getAllAuthors();

  res.render("author_list", { title: "Authors", author_list: allAuthors });
});

// Display details for a specific author
exports.author_detail = asyncHandler(async (req, res, next) => {
  const authorId = req.params.id;
  const [author, comicsByAuthor] = await Promise.all([
    db.getAuthor(authorId), // Fetch author details
    db.getAuthorComics(authorId), // Fetch comics by the author
  ]);

  if (!author) {
    // Handle case where author is not found
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: author.name,
    author: author,
    comic_list: comicsByAuthor,
  });
});

// Display form for creating a new author
exports.author_create_get = (req, res, next) => {
  res.render("author_form", {
    title: "Add a new author",
    author: undefined,
    errors: [],
  });
};

// Handle form submission for creating a new author
exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You must enter a First Name")
    .escape(),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You must enter a Last Name")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req); // Validate request body
    const author = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    };

    if (!errors.isEmpty()) {
      // Handle validation errors
      res.render("author_form", {
        title: "Add a new author",
        author: undefined,
        errors: errors.array(),
      });
      return;
    }

    const existingAuthor = await db.getAuthorByName(
      author.first_name,
      author.last_name,
    );

    if (existingAuthor) {
      // Redirect if author already exists
      res.redirect(existingAuthor.url);
      return;
    }

    await db.saveAuthor(author); // Save new author to the database
    const createdAuthor = await db.getAuthorByName(
      author.first_name,
      author.last_name,
    );
    res.redirect(createdAuthor.url);
  }),
];

// Display form for updating an existing author's information
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const authorId = req.params.id;
  const [author, comicsByAuthor] = await Promise.all([
    db.getAuthor(authorId), // Fetch author details
    db.getAuthorComics(authorId), // Fetch comics by the author
  ]);

  if (!author) {
    // Handle case where author is not found
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_form", {
    title: "Update author's info",
    author: author,
    comic_list: comicsByAuthor,
    errors: [],
  });
});

// Handle form submission for updating an existing author
exports.author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You must enter a First Name")
    .escape(),
  body("last_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("You must enter a Last Name")
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req); // Validate request body
    const authorId = req.params.id;
    const author = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    };

    if (!errors.isEmpty()) {
      // Handle validation errors
      const comicsByAuthor = await db.getAuthorComics(authorId);

      res.render("author_form", {
        title: "Update author's info",
        author: author,
        comic_list: comicsByAuthor,
        errors: errors.array(),
      });
      return;
    }

    // Check if author with the same name already exists
    const existingAuthor = await db.getAuthor(authorId);

    if (
      existingAuthor &&
      existingAuthor.first_name == author.first_name &&
      existingAuthor.last_name == author.last_name
    ) {
      res.redirect(existingAuthor.url);
      return;
    }

    await db.updateAuthor(authorId, author); // Update author in the database
    const updatedAuthor = await db.getAuthorByName(
      author.first_name,
      author.last_name,
    );
    res.redirect(updatedAuthor.url);
  }),
];

// Display form for confirming author deletion
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const authorId = req.params.id;
  const [author, comicsByAuthor] = await Promise.all([
    db.getAuthor(authorId), // Fetch author details
    db.getAuthorComics(authorId), // Fetch comics by the author
  ]);

  if (!author) {
    // Handle case where author is not found
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_delete", {
    title: "Delete author",
    author: author,
    comic_list: comicsByAuthor,
  });
});

// Handle form submission for deleting an author
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const authorId = req.body.authorid;
  const author = await db.getAuthor(authorId);

  if (!author) {
    // Handle case where author is not found
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  await db.deleteAuthor(authorId); // Delete author from the database
  res.redirect("/catalog/authors"); // Redirect to authors list
});
