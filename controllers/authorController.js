const Author = require("../models/author");
const asyncHandler = require("express-async-handler");

// Display list of all authors
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ first_name: 1 }).exec();

  res.render("author_list", { title: "Authors", author_list: allAuthors });
});
