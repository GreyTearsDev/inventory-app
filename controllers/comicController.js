const Comic = require("../models/comic");
const Author = require("../models/author");
const Publisher = require("../models/publisher");
const Genre = require("../models/genre");
const Volume = require("../models/volume");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details about Comics, Authors, Publishers, and Genres
  const [comicCount, volumeCount, authorCount, publisherCount, genreCount] =
    await Promise.all([
      Comic.countDocuments({}).exec(),
      Volume.countDocuments({}).exec(),
      Author.countDocuments({}).exec(),
      Publisher.countDocuments({}).exec(),
      Genre.countDocuments({}).exec(),
    ]);

  res.render("index", {
    title: "ComiKing - Home",
    comic_count: comicCount,
    volume_count: volumeCount,
    author_count: authorCount,
    publisher_count: publisherCount,
    genre_count: genreCount,
  });
});

// List all currently available comics
exports.comic_list = asyncHandler(async (req, res, next) => {
  const allComics = await Comic.find({}, "title summary")
    .sort({ title: 1 })
    .populate("author")
    .populate("genres")
    .exec();

  res.render("comic_list", {
    title: "Comics",
    comic_list: allComics,
  });
});

exports.comic_detail = asyncHandler(async(req, res, next) => {
  const comic = await Comic.findById(req.params.id)
    .populate("publisher")
    .populate("author")
    .populate("genres")
    .exec()

  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  res.render("comic_detail", {
    title: comic.title,
    comic: comic,
  });
})
