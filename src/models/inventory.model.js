const mongoose = require("mongoose");

/**
 * User schema
 */

const InventorySchema = new mongoose.Schema({
  item: [{ type: mongoose.Schema.Types.ObjectId, enum: ["Product", "Theme" ,"ThemePack", "Avatar", "AvatarPack"], default: [] }],
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
