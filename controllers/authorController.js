const Author = require("../models/author");
const asyncHandler = require("async-handler");

// Display list of all authors
exports.author_list = asyncHandler(async (req, res, next) => {
  const authors = await Author.find()
    .sort({ first_name: 1 })
    .populate("Comic")
    .exec();

  res.render("author_list", { title: "List of Authors", author_list: authors });
});
