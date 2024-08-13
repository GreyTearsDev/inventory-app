const { body, validationResult } = require("express-validator");
const db = require("../db/queries");
const date = require("../util/date_formatting");
const array = require("../util/arrays");

const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  // Get details about Comics, Authors, Publishers, and Genres
  const [comics, volumes, authors, publishers, genres] = await Promise.all([
    db.getAllComics(),
    db.getAllVolumes(),
    db.getAllAuthors(),
    db.getAllPublishers(),
    db.getAllGenres(),
  ]);

  res.render("index", {
    title: "ComiKing - Home",
    comic_count: comics.length,
    volume_count: volumes.length,
    author_count: authors.length,
    publisher_count: publishers.length,
    genre_count: genres.length,
  });
});

// List all currently available comics
exports.comic_list = asyncHandler(async (req, res, next) => {
  const allComics = await db.getAllComics();

  res.render("comic_list", {
    title: "Comics",
    comic_list: allComics,
  });
});

exports.comic_detail = asyncHandler(async (req, res, next) => {
  const comicId = req.params.id;
  const [comic, author, publisher, genres, volumes] = await Promise.all([
    db.getComic(comicId),
    db.getComicAuthor(comicId),
    db.getComicPublisher(comicId),
    db.getComicGenres(comicId),
    db.getComicVolumes(comicId),
  ]);

  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  res.render("comic_detail", {
    title: comic.title,
    comic: comic,
    comic_release_date: date.format(comic.release_date),
    author: author,
    genres: genres,
    volumes: volumes,
    publisher: publisher,
  });
});

exports.comic_create_get = asyncHandler(async (req, res, next) => {
  const [authors, publishers, genres] = await Promise.all([
    db.getAllAuthors(),
    db.getAllPublishers(),
    db.getAllGenres(),
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

    if (!errors.isEmpty()) {
      const [authors, publishers, genres] = await Promise.all([
        db.getAllAuthors(),
        db.getAllPublishers(),
        db.getAllGenres(),
      ]);

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

    await db.saveComic(comic);
    const savedComic = await db.getComicByTitleAndAuthor(comic);
    res.redirect(savedComic.url);
  }),
];

exports.comic_update_get = asyncHandler(async (req, res, next) => {
  const comicId = req.params.id;
  const [comic, comicGenres, authors, publishers, genres] = await Promise.all([
    db.getComic(comicId),
    db.getComicGenres(comicId),
    db.getAllAuthors(),
    db.getAllPublishers(),
    db.getAllGenres(),
  ]);

  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  const comicGenreIds = comicGenres.map((genre) => genre.id);

  for (const id of comicGenreIds) {
    genres.forEach((genre) => {
      if (genre.id == id) {
        genre.checked = "true";
      }
    });
  }

  const comicReleaseDate = date.format_dash(date.format(comic.release_date));

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

exports.comic_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genres)) {
      req.body.genres =
        typeof req.body.genres === "undefined" ? [] : [req.body.genres];
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

    if (!errors.isEmpty()) {
      const [authors, comicGenres, publishers, genres] = await Promise.all([
        db.getAllAuthors(),
        db.getComicGenres(comicId),
        db.getAllPublishers(),
        db.getAllGenres(),
      ]);

      const comicGenreIds = comicGenres.map((genre) => genre.id);

      for (const id of comicGenreIds) {
        genres.forEach((genre) => {
          if (genre.id == id) {
            genre.checked = "true";
          }
        });
      }

      const comicReleaseDate = date.format_dash(
        date.format(comic.release_date),
      );

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

    const [existingComic, comicGenres] = await Promise.all([
      db.getComic(comicId),
      db.getComicGenres(comicId),
    ]);

    const comicGenresIds = comicGenres.map((g) => g.id);
    const updatedGenresIds = comic.genres.map((g) => parseInt(g));

    const arraysHaveSameValues = array.arraysHaveSameValues(
      comicGenresIds,
      updatedGenresIds,
    );
    const releaseDatesAreEqual =
      date.format(existingComic.release_date) ==
      date.format(comic.release_date);

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

    await db.updateComic(comicId, comic);
    const updatedComic = await db.getComicByTitleAndAuthor(comic);
    res.redirect(updatedComic.url);
  }),
];

// == COMIC_VOLUME RELATED FUNCTIONALITY ==//
exports.comic_volume_create_get = (req, res, next) => {
  const volume = new Volume({
    volume_number: undefined,
    title: undefined,
    description: undefined,
    release_date: undefined,
  });

  res.render("volume_form", {
    title: "Create new volume",
    volume: volume,
    errors: [],
  });
};

exports.comic_volume_create_post = [
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

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const volume = new Volume({
      volume_number: req.body.volume_number || undefined,
      title: req.body.volume_title || undefined,
      description: req.body.volume_description || undefined,
      release_date: req.body.volume_release_date || undefined,
    });

    if (!errors.isEmpty()) {
      res.render("volume_form", {
        title: "Create a new volume",
        volume: volume,
        errors: errors.array(),
      });
      return;
    }
    // Check if a volume with the same number already exists
    const comic = await Comic.findById(req.params.id, "volumes")
      .populate("volumes")
      .exec();

    const existingVolume = comic.volumes.find(
      (volume) => volume.volume_number == req.body.volume_number,
    );

    if (existingVolume) {
      const error = { msg: "A volume with this number already exists" };

      res.render("volume_form", {
        title: "Create a new volume",
        volume: volume,
        errors: [error],
      });
      return;
    }

    await volume.save();
    await Comic.updateOne({ _id: comic._id }, { $push: { volumes: volume } });
    res.redirect(comic.url);
  }),
];

exports.comic_delete_get = asyncHandler(async (req, res, next) => {
  const comic = await Comic.findById(req.params.id).exec();

  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  res.render("comic_delete", {
    title: "Delete comic",
    comic: comic,
  });
});

exports.comic_delete_post = asyncHandler(async (req, res, next) => {
  const comicId = req.body.comicid;
  const comic = await Comic.findById(comicId).exec();

  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  await Comic.findByIdAndDelete(comicId);
  res.redirect("/catalog/comics");
});
