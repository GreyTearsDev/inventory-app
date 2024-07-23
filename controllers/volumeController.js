const Volume = require("../models/volume");
const Comic = require("../models/comic");
const asyncHandler = require("express-async-handler");

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
