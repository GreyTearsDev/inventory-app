const Comic = require("../models/comic");
const Author = require("../models/author");
const Publisher = require("../models/publisher");
const Genre = require("../models/genre");
const Volume = require("../models/volume");
const { body, validationResult } = require("express-validator");
const { ObjectId } = require("mongoose").Types;

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

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const comic = new Comic({
      title: req.body.title,
      summary: req.body.summary,
      author: req.body.author,
      publisher: req.body.publisher,
      genres: req.body.genres.map((id) => new ObjectId(id)),
      release_date: req.body.release_date,
    });

    if (!errors.isEmpty()) {
      const [authors, genres, publishers] = await Promise.all([
        Author.find().sort({ first_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
        Publisher.find().sort({ name: 1 }).exec(),
      ]);

      for (const gen of genres) {
        if (req.body.genre.includes(gen._id.toString())) {
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
    } else {
      await comic.save();
      res.redirect(comic.url);
    }
  }),
];

exports.comic_update_get = asyncHandler(async (req, res, next) => {
  const [comic, authors, genres, publishers] = await Promise.all([
    Comic.findById(req.params.id).exec(),
    Author.find().sort({ first_name: 1 }).exec(),
    Genre.find().sort({ name: 1 }).exec(),
    Publisher.find().sort({ name: 1 }).exec(),
  ]);

  if (!comic) {
    const err = new Error("Comic not found");
    err.status = 404;
    return next(err);
  }

  for (const gen of genres) {
    if (comic.genres.includes(gen._id.toString())) {
      gen.checked = "true";
    }
  }

  res.render("comic_form", {
    title: "Update the comic's info",
    comic: comic,
    author_list: authors,
    genre_list: genres,
    publisher_list: publishers,
    selected_author_id: comic.author._id,
    selected_publisher_id: comic.publisher._id,
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
    const comic = new Comic({
      title: req.body.title,
      summary: req.body.summary,
      author: req.body.author,
      publisher: req.body.publisher,
      genres: req.body.genres.map((id) => new ObjectId(id)),
      release_date: req.body.release_date,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const [comic, authors, genres, publishers] = await Promise.all([
        Comic.findById(req.params.id).exec(),
        Author.find().sort({ first_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
        Publisher.find().sort({ name: 1 }).exec(),
      ]);

      for (const gen of genres) {
        if (req.body.genres.includes(gen._id.toString())) {
          gen.checked = "true";
        }
      }

      res.render("comic_form", {
        title: "Update the comic's info",
        comic: comic,
        author_list: authors,
        genre_list: genres,
        publisher_list: publishers,
        selected_author_id: comic.author._id,
        selected_publisher_id: comic.publisher._id,
        errors: errors.array(),
      });
      return;
    }

    const existingComic = await Comic.findOne({
      title: req.body.title,
      summary: req.body.summary,
      author: req.body.author,
      publisher: req.body.publisher,
      genres: req.body.genres,
    });
    console.log(existingComic);

    if (existingComic) {
      res.redirect(existingComic.url);
      return;
    }

    await Comic.findByIdAndUpdate(req.params.id, comic);
    res.redirect(comic.url);
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

  console.log(comic);

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
