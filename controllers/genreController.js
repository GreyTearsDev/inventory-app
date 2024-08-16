// Import required modules
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

// Controller for listing all available genres
exports.genre_list = asyncHandler(async (req, res, next) => {
  // Fetch all genres from the database
  const allGenres = await db.getAllFromTable("genres");
  // Render the genre list page with the retrieved genres
  res.render("genre_list", { title: "Genres", genre_list: allGenres });
});

// Controller for retrieving the details of a specific genre
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id;
  // Fetch the genre and its associated comics concurrently
  const [genre, comicsOfGenre] = await Promise.all([
    db.getSingleFromTable("genres", genreId),
    db.getGenreComics(genreId),
  ]);

  // If the genre is not found, return a 404 error
  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  // Render the genre detail page with the retrieved data
  res.render("genre_detail", {
    title: genre.name,
    genre: genre,
    comic_list: comicsOfGenre,
  });
});

// Controller for displaying the genre creation form
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", {
    title: "Create new genre",
    genre: undefined,
    errors: [],
  });
};

// Controller for handling the genre creation form submission
exports.genre_create_post = [
  // Validate and sanitize the genre name input
  body("name", "Name field must be filled")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = {
      name: req.body.name,
    };

    // If there are validation errors, re-render the form with errors
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create new genre",
        genre: undefined,
        errors: errors.array(),
      });
      return;
    }

    // Check if a genre with the same name already exists
    const existingGenre = await db.getGenreByName(genre.name);
    if (existingGenre) {
      // Redirect to the existing genre's detail page if it exists
      res.redirect(existingGenre.url);
      return;
    }

    // Save the new genre to the database and redirect to its detail page
    await db.saveGenre(genre);
    const createdGenre = await db.getGenreByName(genre.name);
    res.redirect(createdGenre.url);
  }),
];

// Controller for displaying the genre update form
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id;
  const genre = await db.getSingleFromTable("genres", genreId);

  // If the genre is not found, return a 404 error
  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  // Render the genre update form with the existing genre data
  res.render("genre_form", {
    title: "Update genre info",
    genre: genre,
    errors: [],
  });
});

// Controller for handling the genre update form submission
exports.genre_update_post = [
  // Validate and sanitize the genre name input
  body("name", "Name field must be filled")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genreId = req.params.id;
    const genre = {
      name: req.body.name,
    };

    // If there are validation errors, re-render the form with errors
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create new genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    }

    // Check if a genre with the same name already exists
    const existingGenre = await db.getSingleFromTable("genres", genreId);
    if (existingGenre && existingGenre.name == genre.name) {
      // Redirect to the existing genre's detail page if it already exists
      res.redirect(existingGenre.url);
      return;
    }

    // Update the genre in the database and redirect to its detail page
    await db.updateGenre(genreId, genre);
    const updatedGenre = await db.getGenreByName(genre.name);
    res.redirect(updatedGenre.url);
  }),
];

// Controller for displaying the genre deletion confirmation page
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id;
  // Fetch the genre and its associated comics concurrently
  const [genre, comicsOfGenre] = await Promise.all([
    db.getSingleFromTable("genres", genreId),
    db.getGenreComics(genreId),
  ]);

  // If the genre is not found, return a 404 error
  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  // Render the genre deletion confirmation page with the retrieved data
  res.render("genre_delete", {
    title: "Delete genre",
    genre: genre,
    comic_list: comicsOfGenre,
  });
});

// Controller for handling the genre deletion form submission
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const genreId = req.body.genreid;
  const genre = await db.getSingleFromTable("genres", genreId);

  // If the genre is not found, return a 404 error
  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  // Delete the genre from the database and redirect to the genre list
  await db.deleteGenre(genreId);
  res.redirect("/catalog/genres");
});
