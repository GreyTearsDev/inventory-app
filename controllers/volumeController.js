const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const db = require("../db/queries");
const date = require("../util/date_formatting");

// Handler for displaying volume details
exports.volume_detail = asyncHandler(async (req, res, next) => {
  const volumeId = req.params.id;
  const volume = await db.getVolume(volumeId); // Retrieve the volume from the database
  const volumeReleaseDate = date.formJSDateToStringDMY(volume.release_date); // Format the release date

  const associatedComic = await db.getComic(volume.comic_id); // Retrieve the associated comic

  // If the volume is not found, return a 404 error
  if (!volume) {
    const err = new Error("Volume not found");
    err.status = 404;
    return next(err);
  }

  // If the comic associated with the volume is not found, return a 404 error
  if (!associatedComic) {
    const err = new Error("This volume is not associated to any comic");
    err.status = 404;
    return next(err);
  }

  // Render the volume detail page with the retrieved data
  res.render("volume_detail", {
    title: "Volume details",
    volume: volume,
    volume_release_date: volumeReleaseDate,
    comic: associatedComic,
  });
});

// Handler for displaying the volume delete confirmation page
exports.volume_delete_get = asyncHandler(async (req, res, next) => {
  const volumeId = req.params.id;
  const volume = await db.getVolume(volumeId); // Retrieve the volume from the database

  // If the volume is not found, return a 404 error
  if (!volume) {
    const err = new Error("Volume not found");
    err.status = 404;
    return next(err);
  }

  // Render the volume delete confirmation page
  res.render("volume_delete", {
    title: "Delete",
    volume: volume,
  });
});

// Handler for processing the volume deletion
exports.volume_delete_post = asyncHandler(async (req, res, next) => {
  const volumeId = req.params.id;
  const volume = await db.getVolume(volumeId); // Retrieve the volume from the database
  const associatedComic = await db.getComic(volume.comic_id); // Retrieve the associated comic

  // If the volume is not found, return a 404 error
  if (!volume) {
    const err = new Error("Volume not found");
    err.status = 404;
    return next(err);
  }

  // If the comic associated with the volume is not found, return a 404 error
  if (!associatedComic) {
    const err = new Error("This volume is not associated to any comic");
    err.status = 404;
    return next(err);
  }

  // Delete the volume from the database
  await db.deleteVolume(volumeId);

  // Redirect to the associated comic's detail page after deletion
  res.redirect(associatedComic.url);
});

// Handler for displaying the volume update form
exports.volume_update_get = asyncHandler(async (req, res, next) => {
  const volumeId = req.params.id;
  const volume = await db.getVolume(volumeId); // Retrieve the volume from the database
  const currentVolumeNumber = volume.volume_number;
  const volumeReleaseDate = date.fromJSDateToStringYMD(volume.release_date); // Format the release date

  // Render the volume update form with the current volume data
  res.render("volume_form", {
    title: "Update volume",
    volume: volume,
    last_volume_number: currentVolumeNumber === 1 ? 0 : currentVolumeNumber - 1,
    volume_release_date: volumeReleaseDate,
    errors: [],
  });
});

// Handler for processing the volume update
exports.volume_update_post = [
  // Validation and sanitization for the volume number field
  body("volume_number", "Volume number field must be filled")
    .trim()
    .notEmpty()
    .escape(),

  // Validation and sanitization for the volume title field
  body("volume_title")
    .trim()
    .notEmpty()
    .withMessage("Title field must be filled")
    .isLength({ max: 100 })
    .withMessage("This title is too long")
    .escape(),

  // Validation and sanitization for the volume description field
  body("volume_description")
    .trim()
    .notEmpty()
    .withMessage("Description field must be filled")
    .isLength({ max: 200 })
    .withMessage("This description is too long")
    .escape(),

  // Validation and sanitization for the volume release date field
  body("volume_release_date", "Invalid date")
    .optional({ value: "falsy" })
    .isISO8601()
    .toDate()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const volumeId = req.params.id;
    const volumeToUpdate = await db.getVolume(volumeId); // Retrieve the volume to be updated

    const currentVolumeNumber = volumeToUpdate.volume_number;
    const currentVolumeReleaseDate = date.fromJSDateToStringYMD(
      volumeToUpdate.release_date,
    ); // Format the current release date

    const newVolumeInfo = {
      volume_number: req.body.volume_number || undefined,
      title: req.body.volume_title || undefined,
      description: req.body.volume_description || undefined,
      release_date: req.body.volume_release_date || undefined,
    };

    // If there are validation errors, re-render the form with error messages
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
    const volumeList = await db.getAllFromTable("volumes"); // Retrieve all volumes

    const existingVolume = volumeList
      .filter((volume) => (volume.comic_id = volumeToUpdate.id)) // filter only the volumes related to the same comic as the volume to update
      .find((volume) => volume.id == volumeId); // filter the volume that has the same id

    // Check if the new release date is the same as the old one already stored
    const releaseDatesAreEqual =
      date.fromJSDateToStringYMD(volumeToUpdate.release_date) ===
      date.fromJSDateToStringYMD(new Date(newVolumeInfo.release_date));

    // Check if the rest of the new info is exactly the same as the info already stored
    const infoIsTheSame =
      volumeToUpdate.volume_number == newVolumeInfo.volume_number &&
      volumeToUpdate.title == newVolumeInfo.title &&
      volumeToUpdate.description == newVolumeInfo.description &&
      releaseDatesAreEqual;

    // If the updated information is the same as the existing one, redirect to the volume's detail page
    if (existingVolume && infoIsTheSame) {
      res.redirect(existingVolume.url);
      return;
    }

    // Update the volume in the database and redirect to the comic's detail page
    await db.updateVolume(volumeToUpdate.id, newVolumeInfo);
    const comic = await db.getComic(volumeToUpdate.comic_id);
    res.redirect(comic.url);
  }),
];
