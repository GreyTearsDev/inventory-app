const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");
const date = require("../util/date_formatting");

exports.volume_detail = asyncHandler(async (req, res, next) => {
  const volumeId = req.params.id;
  const volume = await db.getVolume(volumeId);
  const volumeReleaseDate = date.formJSDateToStringDMY(volume.release_date);

  const associatedComic = await db.getComic(volume.comic_id);

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
    volume_release_date: volumeReleaseDate,
    comic: associatedComic,
  });
});

exports.volume_delete_get = asyncHandler(async (req, res, next) => {
  const volumeId = req.params.id;
  const volume = await db.getVolume(volumeId);

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
  const volumeId = req.params.id;
  const volume = await db.getVolume(volumeId);
  const associatedComic = await db.getComic(volume.comic_id);

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

  await db.deleteVolume(volumeId);
  res.redirect(associatedComic.url);
});

exports.volume_update_get = asyncHandler(async (req, res, next) => {
  const volumeId = req.params.id;
  const volume = await db.getVolume(volumeId);
  const currentVolumeNumber = volume.volume_number;
  const volumeReleaseDate = date.fromJSDateToStringYMD(volume.release_date);

  res.render("volume_form", {
    title: "Update volume",
    volume: volume,
    last_volume_number: currentVolumeNumber === 1 ? 0 : currentVolumeNumber - 1,
    volume_release_date: volumeReleaseDate,
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
    const volumeId = req.params.id;
    const volumeToUpdate = await db.getVolume(volumeId);

    const volumeList = await db.getAllVolumes(volumeToUpdate.comic_id); // all existing volumes
    const currentVolumeNumber = volumeToUpdate.volume_number;
    const currentVolumeReleaseDate = date.fromJSDateToStringYMD(
      volumeToUpdate.release_date,
    );

    const newVolumeInfo = {
      volume_number: req.body.volume_number || undefined,
      title: req.body.volume_title || undefined,
      description: req.body.volume_description || undefined,
      release_date: req.body.volume_release_date || undefined,
    };

    if (!errors.isEmpty()) {
      res.render("volume_form", {
        title: "Update volume",
        volume: newVolumeInfo,
        last_volume_number:
          currentVolumeNumber === 1 ? 0 : currentVolumeNumber - 1,
        volume_release_date: currentVolumeReleaseDate,
        errors: [],
      });
      return;
    }

    // Check if a volume with the same number already exists
    const existingVolume = volumeList.find((volume) => volume.id == volumeId);

    // Check if new release date is the same as the old one already stored
    const releaseDatesAreEqual =
      date.fromJSDateToStringYMD(volumeToUpdate.release_date) ===
      date.fromJSDateToStringYMD(new Date(newVolumeInfo.release_date));

    // Check if the rest of new info is exactly the same as the info already stored
    const infoIsTheSame =
      volumeToUpdate.volume_number == newVolumeInfo.volume_number &&
      volumeToUpdate.title == newVolumeInfo.title &&
      volumeToUpdate.description == newVolumeInfo.description &&
      releaseDatesAreEqual;

    if (existingVolume && infoIsTheSame) {
      res.redirect(existingVolume.url);
      return;
    }

    // Update the volume and redirect to the comic's detail page
    await db.updateVolume(volumeToUpdate.id, newVolumeInfo);
    const comic = await db.getComic(volumeToUpdate.comic_id);
    res.redirect(comic.url);
  }),
];
