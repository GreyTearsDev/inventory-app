const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const VolumeSchema = new Schema({
  volume_number: { type: Number, min: 0, required: true },
  title: { type: String, maxLength: 100, required: true },
  description: { type: String, maxLength: 200, required: true },
  release_date: { type: Date, default: Date.now },
});

VolumeSchema.virtual("date_formatted").get(function () {
  return this.release_date
    ? DateTime.fromJSDate(this.release_date).toLocaleString(DateTime.DATE_MED)
    : "";
});

VolumeSchema.virtual("url").get(function () {
  return `/catalog/volume/${this._id}`;
});

module.exports = mongoose.model("Volume", VolumeSchema);
