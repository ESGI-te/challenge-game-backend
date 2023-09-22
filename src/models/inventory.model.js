const mongoose = require("mongoose");

/**
 * User schema
 */

const InventorySchema = new mongoose.Schema({
  themes: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuizzTheme", default: [] }],
  theme_packs: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuizzTheme", default: [] }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true  },
});

/**
 * Methods
 */

InventorySchema.methods = {};

/**
 * Statics
 */

InventorySchema.statics = {};

const Produit = mongoose.model("Inventory", InventorySchema);

module.exports = Produit;
