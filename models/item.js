const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 100 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  price: { type: Number, min: 1 },
  stock: { type: Number, min: 0 },
});

// Export model
module.exports = mongoose.model("Item", ItemSchema);
