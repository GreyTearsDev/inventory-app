const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 40 },
  last_name: { type: String, required: true, maxLength: 40 },
  biography: {type: String, maxLength: 400}
});

AuthorSchema.virtual("name").get(function () {
  let fullname = "";

  if (this.first_name && this.last_name) {
    fullname = `${this.first_name} ${this.last_name}`;
  }
  return fullname;
});

AuthorSchema.virtual("url").get(function () {
  return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model("Author", AuthorSchema);
