const { body, validationResult } = require("express-validator");
const db = require("../db/queries");
const date = require("../util/date_formatting");
const array = require("../util/arrays");

const asyncHandler = require("express-async-handler");

// Handler to render the home page with statistics about comics, authors, publishers, and genres
exports.index = asyncHandler(async (req, res, next) => {
  const [comics, volumes, authors, publishers, genres] = await Promise.all([
    db.getAllComics(),
    db.getTotalVolumeCount(), // returns the total amount of volumes in the database
    db.getAllAuthors(),
    db.getAllPublishers(),
    db.getAllGenres(),
  ]);

  // Render the home page with counts of each entity
  res.render("index", {
    title: "Home",
    comic_count: comics.length,
    volume_count: volumes, // it is an integer, so no length property
    author_count: authors.length,
    publisher_count: publishers.length,
    genre_count: genres.length,
  });
});

// Handler to render a list of all available comics
exports.comic_list = asyncHandler(async (req, res, next) => {
  const allComics = await db.getAllComics();

  // Render the comic list page with all comics
  res.render("comic_list", {
    title: "Comics",
    comic_list: allComics,
  });
});

// Handler to render details for a specific comic
exports.comic_detail = asyncHandler(async (req, res, next) => {
  const comicId = req.params.id;

  // Fetch details about the comic, its author, publisher, genres, and volumes
  const [comic, author, publisher, genres, volumes] = await Promise.all([
    db.getComic(comicId),
    db.getComicAuthor(comicId),
    db.getComicPublisher(comicId),
    db.getComicGenres(comicId),
    db.getComicVolumes(comicId),
  ]);

  // Handle case where the comic is not found
  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  const comicReleaseDate = date.formJSDateToStringDMY(comic.release_date);

  // Render the comic detail page with all fetched information
  res.render("comic_detail", {
    title: comic.title,
    comic: comic,
    comic_release_date: comicReleaseDate,
    author: author,
    genres: genres,
    volumes: volumes,
    publisher: publisher,
  });
});

// Handler to render the form for creating a new comic
exports.comic_create_get = asyncHandler(async (req, res, next) => {
  // Fetch lists of authors, publishers, and genres for the form options
  const [authors, publishers, genres] = await Promise.all([
    db.getAllAuthors(),
    db.getAllPublishers(),
    db.getAllGenres(),
  ]);

  // Render the comic creation form
  res.render("comic_form", {
    title: "Add a new comic",
    comic: undefined, // No comic data yet as this is a new entry
    author_list: authors,
    genre_list: genres,
    publisher_list: publishers,
    release_date: undefined,
    selected_author_id: undefined,
    selected_publisher_id: undefined,
    errors: [],
  });
});

// Handler to process the form submission for creating a new comic
exports.comic_create_post = [
  // Ensure 'req.body.genre' is an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validation rules for comic creation form
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
  body("publisher", "You must choose a publisher for the comic")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),

  // Handle the form submission
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const comic = {
      title: req.body.title,
      summary: req.body.summary,
      author: req.body.author,
      publisher: req.body.publisher,
      genres: req.body.genres,
      release_date: req.body.release_date,
    };

    // If there are validation errors, re-render the form with errors
    if (!errors.isEmpty()) {
      const [authors, publishers, genres] = await Promise.all([
        db.getAllAuthors(),
        db.getAllPublishers(),
        db.getAllGenres(),
      ]);

      // Mark genres as checked based on user input
      for (const gen of genres) {
        if (req.body.genre.includes(gen.id)) {
          gen.checked = "true";
        }
      }

      res.render("comic_form", {
        title: "Add a new comic",
        comic: undefined,
        author_list: authors,
        genre_list: genres,
        publisher_list: publishers,
        selected_author_id: req.body.author || undefined,
        selected_publisher_id: req.body.publisher || undefined,
        errors: errors.array(),
      });

      return;
    }

    // Save the new comic and redirect to its detail page
    await db.saveComic(comic);
    const savedComic = await db.getComicByTitleAndAuthor(comic);
    res.redirect(savedComic.url);
  }),
];

// Handler to render the form for updating an existing comic
exports.comic_update_get = asyncHandler(async (req, res, next) => {
  const comicId = req.params.id;

  // Fetch comic details and related information for the update form
  const [comic, comicGenres, authors, publishers, genres] = await Promise.all([
    db.getComic(comicId),
    db.getComicGenres(comicId),
    db.getAllAuthors(),
    db.getAllPublishers(),
    db.getAllGenres(),
  ]);

  // Handle case where the comic is not found
  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  // Mark existing genres as checked
  const comicGenreIds = comicGenres.map((genre) => genre.id);
  for (const id of comicGenreIds) {
    genres.forEach((genre) => {
      if (genre.id == id) {
        genre.checked = "true";
      }
    });
  }

  const comicReleaseDate = date.fromJSDateToStringYMD(comic.release_date);

  // Render the update form with current comic data
  res.render("comic_form", {
    title: "Update the comic's info",
    comic: comic,
    author_list: authors,
    genre_list: genres,
    release_date: comicReleaseDate,
    publisher_list: publishers,
    selected_author_id: comic.author_id,
    selected_publisher_id: comic.publisher_id,
    errors: [],
  });
});

// Handler to process the form submission for updating a comic
exports.comic_update_post = [
  // Ensure `req.body.genres` is an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genres)) {
      req.body.genres =
        typeof req.body.genres === "undefined" ? [] : [req.body.genres];
    }
    next();
  },

  // Validation rules for comic update form
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
  body("publisher", "You must choose a publisher for the comic")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("genre.*").escape(),

  // Handle the form submission
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const comicId = req.params.id;
    const comic = {
      title: req.body.title,
      summary: req.body.summary,
      author: req.body.author,
      publisher: req.body.publisher,
      genres: req.body.genres,
      release_date: req.body.release_date,
    };

    // If there are validation errors, re-render the form with errors
    if (!errors.isEmpty()) {
      const [authors, comicGenres, publishers, genres] = await Promise.all([
        db.getAllAuthors(),
        db.getComicGenres(comicId),
        db.getAllPublishers(),
        db.getAllGenres(),
      ]);

      // Mark existing genres as checked
      const comicGenreIds = comicGenres.map((genre) => genre.id);
      for (const id of comicGenreIds) {
        genres.forEach((genre) => {
          if (genre.id == id) {
            genre.checked = "true";
          }
        });
      }

      const comicReleaseDate = date.fromJSDateToStringYMD(comic.release_date);

      res.render("comic_form", {
        title: "Add a new comic",
        comic: undefined,
        author_list: authors,
        genre_list: genres,
        publisher_list: publishers,
        release_date: comicReleaseDate,
        selected_author_id: req.body.author || undefined,
        selected_publisher_id: req.body.publisher || undefined,
        errors: errors.array(),
      });

      return;
    }

    // Check if the updated comic is the same as the existing one
    const [existingComic, comicGenres] = await Promise.all([
      db.getComic(comicId),
      db.getComicGenres(comicId),
    ]);

    const comicGenresIds = comicGenres.map((g) => g.id);
    const updatedGenresIds = comic.genres.map((g) => parseInt(g));

    // Helper function to compare if two arrays have the same values
    const arraysHaveSameValues = array.arraysHaveSameValues(
      comicGenresIds,
      updatedGenresIds,
    );
    const releaseDatesAreEqual =
      date.formJSDateToStringDMY(existingComic.release_date) ==
      date.formJSDateToStringDMY(comic.release_date);

    // If no changes, redirect to existing comic's URL
    if (
      existingComic &&
      existingComic.title == comic.title &&
      existingComic.author_id == comic.author &&
      existingComic.summary == comic.summary &&
      releaseDatesAreEqual &&
      arraysHaveSameValues
    ) {
      res.redirect(existingComic.url);
      return;
    }

    // Update the comic and redirect to the updated comic's URL
    await db.updateComic(comicId, comic);
    const updatedComic = await db.getComicByTitleAndAuthor(comic);
    res.redirect(updatedComic.url);
  }),
];

// Handler to render the confirmation page for deleting a comic
exports.comic_delete_get = asyncHandler(async (req, res, next) => {
  const comicId = req.params.id;
  const comic = await db.getComic(comicId);

  // Handle case where the comic is not found
  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  // Render the delete confirmation page
  res.render("comic_delete", {
    title: "Delete comic",
    comic: comic,
  });
});

// Handler to process the deletion of a comic
exports.comic_delete_post = asyncHandler(async (req, res, next) => {
  const comicId = req.params.id;
  const comic = await db.getComic(comicId);

  // Handle case where the comic is not found
  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  // Delete the comic and redirect to the list of comics
  await db.deleteComic(comicId);
  res.redirect("/catalog/comics");
});

// == COMIC_VOLUME RELATED FUNCTIONALITY ==//

// Handler to render the form for creating a new volume for a comic
exports.comic_volume_create_get = asyncHandler(async (req, res, next) => {
  const comicId = req.params.id;

  // Fetch all volumes for the comic and determine the last volume number
  const volumeList = await db.getAllVolumes(comicId);
  const lastVolume = volumeList[volumeList.length - 1] || undefined;

  // Render the volume creation form
  res.render("volume_form", {
    title: "Create new volume",
    last_volume_number: lastVolume ? lastVolume.volume_number : 0, // Handle case where no volumes exist
    volume_release_date: undefined,
    volume: undefined,
    errors: [],
  });
});

// Handler to process the form submission for creating a new volume
exports.comic_volume_create_post = [
  // Validation rules for volume creation form
  body("volume_number", "Volume number field must be filled")
    .trim()
    .notEmpty()
    .escape(),
  body("volume_title")
    .trim()
    .notEmpty()
    .withMessage("Title field must be filled")
    .isLength({ max: 100 })
    .withMessage("This title is too long")
    .escape(),
  body("volume_description")
    .trim()
    .notEmpty()
    .withMessage("Description field must be filled")
    .isLength({ max: 200 })
    .withMessage("This description is too long")
    .escape(),
  body("volume_release_date", "Invalid date")
    .optional({ value: "falsy" })
    .isISO8601()
    .toDate()
    .escape(),

  // Handle the form submission
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const comicId = req.params.id;
    const volumeList = await db.getAllVolumes(comicId);
    const lastVolume = volumeList[volumeList.length - 1] || undefined;

    const volume = {
      title: req.body.volume_title || undefined,
      volume_number: req.body.volume_number || undefined,
      description: req.body.volume_description || undefined,
      release_date: req.body.volume_release_date || undefined,
    };

    // If there are validation errors, re-render the form with errors
    if (!errors.isEmpty()) {
      res.render("volume_form", {
        title: "Create a new volume",
        volume: volume,
        last_volume_number: lastVolume ? lastVolume.volume_number : 0, // Handle case where no volumes exist
        volume_release_date: volume.volume_release_date,
        errors: errors.array(),
      });
      return;
    }

    // Check if a volume with the same number already exists
    const existingVolume = volumeList.find(
      (volume) => volume.volume_number == req.body.volume_number,
    );

    if (existingVolume) {
      const error = {
        msg: `A volume with this number (${existingVolume.volume_number}) already exists`,
      };

      res.render("volume_form", {
        title: "Create a new volume",
        volume: volume,
        last_volume_number: lastVolume ? lastVolume.volume_number : 0, // Handle case where no volumes exist
        volume_release_date: volume.volume_release_date,
        errors: [error],
      });
      return;
    }

    // Save the new volume and redirect to the comic's detail page
    await db.saveVolume(comicId, volume);
    const comic = await db.getComic(comicId);
    res.redirect(comic.url);
  }),
];
