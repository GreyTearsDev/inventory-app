const Volume = require("../models/volume");
const asyncHandler = require("express-async-handler");


exports.volume_detail = asyncHandler(async(req, res, next) => {
  console.log(req.params.id)
  const volume = await Volume.findById(req.params.id).exec();

  if (!volume) {
    const err = new Error("Volume not found");
    err.status = 404;
    return next(err);
  }
console.log("oooi")
  res.render("volume_detail", {title: "Volume details", volume: volume})
})
