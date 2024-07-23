const Volume = require("../models/volume");
const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.volume_detail = asyncHandler(async (req, res, next) => {
  const volume = await Volume.findById(req.params.id).exec();
  const associatedComic = await Comic.findOne({ volumes: volume._id }).exec();

  if (!volume) {
    const err = new Error("Volume not found");
    err.status = 404;
    return next(err);
  }

  if (!associatedComic) {
    const err = new Error("This volume is not associated to any comic");
    err.status = 404;
    return next(err);
  }

  res.render("volume_detail", {
    title: "Volume details",
    volume: volume,
    comic: associatedComic,
  });
});

exports.volume_delete_get = asyncHandler(async (req, res, next) => {
  const volume = await Volume.findById(req.params.id).exec();

  if (!volume) {
    const err = new Error("Volume not found");
    err.status = 404;
    return next(err);
  }

  res.render("volume_delete", {
    title: "Delete",
    volume: volume,
  });
});

exports.volume_delete_post = asyncHandler(async (req, res, next) => {
  const volume = await Volume.findById(req.body.volumeid).exec();
  const associatedComic = await Comic.findOne({ volumes: volume._id }).exec();

  if (!volume) {
    const err = new Error("Volume not found");
    err.status = 404;
    return next(err);
  }

  if (!associatedComic) {
    const err = new Error("This volume is not associated to any comic");
    err.status = 404;
    return next(err);
  }

  await Volume.findByIdAndDelete(req.body.volumeid);
  res.redirect(associatedComic.url);
});

exports.volume_update_get = asyncHandler(async (req, res, next) => {
  const volume = await Volume.findById(req.params.id).exec();

  res.render("volume_form", {
    title: "Update volume",
    volume: volume,
    errors: [],
  });
});

exports.volume_update_post = [
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
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("volume_form", {
        title: "Update volume",
        volume: volume,
        errors: errors.array(),
      });
      return;
    }

    await Volume.findByIdAndUpdate(req.params.id, volume);
    res.redirect(volume.url);
  }),
];
