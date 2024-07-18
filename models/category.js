const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true, maxLength: 100, uppercase: true },
  description: { type: String, required: true, maxLength: 100 },
});

// Compute url property from id
CategorySchema.virtual("url").get(function () {
  return `/inventory/category/${this._id}`;
});

// Export model
module.exports = mongoose.model("Category", CategorySchema);
