const Author = require("../models/author");
const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

// Display list of all authors
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await db.getAllAuthors();

  res.render("author_list", { title: "Authors", author_list: allAuthors });
});

exports.author_detail = asyncHandler(async (req, res, next) => {
  const authorId = req.params.id;
  const [author, comicsByAuthor] = await Promise.all([
    db.getAuthorDetails(authorId),
    db.getComicsOfAuthor(authorId),
  ]);

  if (!author) {
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

exports.author_create_get = (req, res, next) => {
  res.render("author_form", {
    title: "Add a new author",
    author: undefined,
    errors: [],
  });
};

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
    const errors = validationResult(req);
    const author = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    };

    if (!errors.isEmpty()) {
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
      res.redirect(existingAuthor.url);
      return;
    }

    await db.saveAuthor(author);
    const createdAuthor = await db.getAuthorByName(
      author.first_name,
      author.last_name,
    );
    res.redirect(createdAuthor.url);
  }),
];

exports.author_update_get = asyncHandler(async (req, res, next) => {
  const authorId = req.params.id;
  const [author, comicsByAuthor] = await Promise.all([
    db.getAuthorDetails(authorId),
    db.getComicsOfAuthor(authorId),
  ]);

  if (!author) {
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
    const errors = validationResult(req);
    const authorId = req.params.id;
    const author = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
    };

    if (!errors.isEmpty()) {
      const comicsByAuthor = await db.getComicsOfAuthor(authorId);

      res.render("author_form", {
        title: "Update author's info",
        author: author,
        comic_list: comicsByAuthor,
        errors: errors.array(),
      });
      return;
    }

    // check if author with the same name already exists
    const existingAuthor = await db.getAuthorDetails(authorId);

    if (
      existingAuthor &&
      existingAuthor.first_name == author.first_name &&
      existingAuthor.last_name == author.last_name
    ) {
      res.redirect(existingAuthor.url);
      return;
    }

    await db.updateAuthor(authorId, author);
    const updatedAuthor = await db.getAuthorByName(
      author.first_name,
      author.last_name,
    );
    res.redirect(updatedAuthor.url);
  }),
];

exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const authorId = req.params.id;
  const [author, comicsByAuthor] = await Promise.all([
    db.getAuthorDetails(authorId),
    db.getComicsOfAuthor(authorId),
  ]);

  if (!author) {
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

exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const authorId = req.body.authorid;
  const author = await db.getAuthorDetails(authorId);

  if (!author) {
    const err = new Error("Author not found");
    err.stauts = 404;
    return next(err);
  }

  await db.deleteAuthor(authorId);
  res.redirect("/catalog/authors");
});
