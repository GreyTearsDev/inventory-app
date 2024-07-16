const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PublisherSchema = new Schema({
  name: { type: String, required: true, maxLength: 40 },
  headquarters: { type: String, maxLength: 40 },
});

PublisherSchema.virtual("info").get(function () {
  return `${this.name}, ${this.headquarters}`;
});

PublisherSchema.virtual("url").get(function () {
  return `/catalog/publisher/${this._id}`;
});

module.exports = mongoose.model("Publisher", PublisherSchema);
