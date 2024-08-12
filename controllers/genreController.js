const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

// List all currently available genres
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await db.getAllGenres();

  res.render("genre_list", { title: "Genres", genre_list: allGenres });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id;
  const [genre, comicsOfGenre] = await Promise.all([
    db.getGenreDetails(genreId),
    db.getComicsOfGenre(genreId),
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
    const genreName = req.body.name;
    const genre = {
      name: genreName,
    };

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create new genre",
        genre: undefined,
        errors: errors.array(),
      });
      return;
    }
    const existingGenre = await db.getGenreByName(genreName);

    if (existingGenre) {
      res.redirect(existingGenre.url);
      return;
    }

    await db.saveGenre(genre);
    const createdGenre = await db.getGenreByName(genreName);
    res.redirect(createdGenre.url);
  }),
];

exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id;
  const genre = await db.getGenreDetails(genreId);

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
    const genreId = req.params.id;
    const newGenreName = req.body.name;
    const genre = {
      name: newGenreName,
    };

    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create new genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    }
    // check if genre with the same name already exists
    const existingGenre = await db.getGenreDetails(genreId);

    if (existingGenre && existingGenre.name == newGenreName) {
      res.redirect(existingGenre.url);
      return;
    }

    await db.updateGenre(genreId, newGenreName);
    const updatedGenre = await db.getGenreByName(newGenreName);
    res.redirect(updatedGenre.url);
  }),
];

exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id;
  const [genre, comicsOfGenre] = await Promise.all([
    Genre.findById(genreId).exec(),
    Comic.find({ genres: { $in: genreId } }).exec(),
  ]);

  if (!genre) {
    const err = new Error("Genre not found");
    err.stauts = 404;
    return next(err);
  }

  res.render("genre_delete", {
    title: "Delete genre",
    genre: genre,
    comic_list: comicsOfGenre,
  });
});

exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const genreId = req.body.genreid;
  const genre = await Genre.findById(genreId).exec();

  if (!genre) {
    const err = new Error("Genre not found");
    err.stauts = 404;
    return next(err);
  }

  await Genre.findByIdAndDelete(genreId);
  res.redirect("/catalog/genres");
});
