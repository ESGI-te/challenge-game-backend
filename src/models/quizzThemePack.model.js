const mongoose = require("mongoose");

/**
 * User schema
 */

const QuizzThemePackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  description: { type: String, required: true },
  themes: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuizzTheme", default: [] }],
});

/**
 * Methods
 */

QuizzThemePackSchema.methods = {};

/**
 * Statics
 */

QuizzThemePackSchema.statics = {};

const Produit = mongoose.model("QuizzThemePack", QuizzThemePackSchema);

module.exports = Produit;
