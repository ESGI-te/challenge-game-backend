const mongoose = require("mongoose");

/**
 * User schema
 */

const ProductSchema = new mongoose.Schema({
  id: {type: Number,required: true},
  name: { type: String, required: true },
  imageUrl: {type: String},
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
});

/**
 * Methods
 */

ProductSchema.methods = {};

/**
 * Statics
 */

ProductSchema.statics = {};

const Produit = mongoose.model("Product", ProductSchema);

module.exports = Produit;
