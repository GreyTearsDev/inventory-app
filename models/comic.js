const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { DateTime } = require("luxon");

const ComicSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  summary: { type: String, required: true, maxLength: 200 },
  author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
  release_date: { type: Date, default: Date.now },
  publisher: { type: Schema.Types.ObjectId, ref: "Publisher", required: true },
  genres: [{ type: Schema.Types.ObjectId, ref: "Genre", required: true }],
  volumes: [{ type: Schema.Types.ObjectId, ref: "Volume" }],
});

ComicSchema.virtual("date_formatted").get(function () {
  return this.release_date
    ? DateTime.fromJSDate(this.release_date).toLocaleString(DateTime.DATE_MED)
    : "";
});

ComicSchema.virtual("url").get(function () {
  return `/catalog/comic/${this._id}`;
});

module.exports = mongoose.model("Comic", ComicSchema);
