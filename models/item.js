const mongoose = require("mongoose");
const Category = require("../models/category");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 100 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, min: 1 },
  stock: { type: Number, min: 0 },
});

// Compute url property from id
ItemSchema.virtual("url").get(function () {
  return `/inventory/item/${this._id}`;
});

// Export model
module.exports = mongoose.model("Item", ItemSchema);
