const Genre = require("../models/genre");
const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// List all currently available genres
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();

  res.render("genre_list", { title: "Genres", genre_list: allGenres });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id;
  const [genre, comicsOfGenre] = await Promise.all([
    Genre.findById(genreId).exec(),
    Comic.find({ genres: genreId }, "title").exec(),
  ]);

  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {
    title: `Genre details (${genre.name})`,
    genre: genre,
    comic_list: comicsOfGenre,
  });
});

exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", {
    title: "Create new genre",
    genre: undefined,
    errors: [],
  });
};

exports.genre_create_post = [
  body("name", "Name field must be filled")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
    });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create new genre",
        genre: undefined,
        errors: errors.array(),
      });
      return;
    } else {
      // check if genre already exists
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();

      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  }),
];

exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_form", {
    title: "Update genre info",
    genre: genre,
    errors: [],
  });
});

exports.genre_update_post = [
  body("name", "Name field must be filled")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create new genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // check if genre with the same name already exists
      const genreExists = await Genre.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 3 })
        .exec();

      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await Genre.findByIdAndUpdate(req.params.id, genre);
        res.redirect(genre.url);
      }
    }
  }),
];
