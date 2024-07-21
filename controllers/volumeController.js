const Volume = require("../models/volume");
const asyncHandler = require("express-async-handler");

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
