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

exports.comic_detail = asyncHandler(async (req, res, next) => {
  const comic = await Comic.findById(req.params.id)
    .populate("publisher")
    .populate("author")
    .populate("genres")
    .populate("volumes")
    .exec();

  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  res.render("comic_detail", {
    title: comic.title,
    comic: comic,
  });
});

exports.comic_create_get = asyncHandler(async (req, res, next) => {
  const [authors, genres, publishers] = await Promise.all([
    Author.find().sort({ first_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
    Publisher.find().sort({ name: 1 }).exec(),
  ]);

  res.render("comic_form", {
    title: "Add a new comic",
    comic: undefined,
    author_list: authors,
    genre_list: genres,
    publisher_list: publishers,
    selected_author_id: undefined,
    selected_publisher_id: undefined,
    errors: [],
  });
});

exports.comic_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title field must be filled")
    .isLength({ max: 100 })
    .withMessage("This title is too long")
    .escape(),
  body("summary")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Summary field must be filled")
    .isLength({ max: 200 })
    .withMessage("This summary is too long")
    .escape(),
  body("release_date", "Invalid date")
    .optional({ value: "falsy" })
    .isISO8601()
    .toDate(),
  body("author", "You must choose an author for the comic")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("publisher", "You must choose an publisher for the comic")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),
];
