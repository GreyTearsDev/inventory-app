const Author = require("../models/author");
const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");

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
    const err = new Erro("Author not found");
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
