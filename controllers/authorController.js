const Author = require("../models/author");
const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all authors
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ first_name: 1 }).exec();

  res.render("author_list", { title: "Authors", author_list: allAuthors });
});

exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, comicsByAuthor] = await Promise.all([
    Author.findById(req.params.id).sort({ first_name: 1 }).exec(),
    Comic.find({ author: req.params.id }, "title").sort({ title: 1 }).exec(),
  ]);

  if (!author) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: "Author Profile",
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
  body("first_name").trim().escape(),
  body("last_name").trim().escape(),
  body("biography").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      headquarters: req.body.headquarters,
    });

    if (!errors.isEmpty) {
      res.render("author_form", {
        title: "Add a new author",
        author: undefined,
        errors: errors.array(),
      });
      return;
    } else {
      const existingAuthor = await Author.findOne({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        headquarters: req.body.headquarters,
      });

      if (existingAuthor) {
        res.redirect(existingAuthor.url);
      } else {
        await author.save();
        res.redirect(author.url);
      }
    }
  }),
];
