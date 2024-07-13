const Comic = require("../models/comic");
const Authors = require("../models/authors");
const Publishers = require("../models/publishers");
const Genres = require("../models/genres");

const asyncHandler = require("async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details about Comics, Authors, Publishers, and Genres

  const [allComics, allAuthors, allPublishers, allGenres] = await Promise.all([
    Comic.find({}, "title author").sort({ title: 1 }).exec(),
    Author.find().sort({ first_name: 1 }).exec(),
    Publisher.find({}, "name").sort({ name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
  ]);

  res.render("index", {
    title: "ComiKing - Home",
    comic_list: allComics,
    author_list: allAuthors,
    publisher_list: allPublishers,
    genre_list: allGenres,
  });
});
