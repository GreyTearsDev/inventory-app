const Volume = require("../models/volume");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.volume_detail = asyncHandler(async (req, res, next) => {
  console.log(req.params.id);
  const volume = await Volume.findById(req.params.id).exec();

  if (!volume) {
    const err = new Error("Volume not found");
    err.status = 404;
    return next(err);
  }
  res.render("volume_detail", { title: "Volume details", volume: volume });
});

exports.volume_create_get = (req, res, next) => {
  res.render("volume_create", {
    title: "Create new volume",
    volume_number: undefined,
    volume_title: undefined,
    volume_description: undefined,
    volume_release_date: undefined,
    errors: [],
  });
};

exports.volume_creat_post = [
  body("volume_volume")
    .isNumeric()
    .withMessage("Volume number must be a numeric value")
    .isInt({ min: 0, max: 1000000 })
    .withMessage(
      "Volume number must be between at least 0 and not greater than 1.000.000",
    )
    .escape(),

  body("volume_title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title field must be filled")
    .isLength({ max: 100 })
    .withMessage("This title is too long")
    .escape(),

  bosy("volume_description")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description field must be filled")
    .isLength({ max: 200 })
    .withMessage("This description is too long")
    .escape(),

  body("volume_release_date", "Invalid date")
    .optional({ value: "falsy" })
    .isISO8601()
    .toDate()
    .escape(),
];
