const mongoose = require("mongoose");

/**
 * User schema
 */

const BoutiqueSchema = new mongoose.Schema({
  Id: { type: Number, required: true },
  ItemName: { type: String, required: true },
  Description: { type: String },
  Prix: { type: String, required: true },
});

module.exports = Boutique;


/**
 * Methods
 */

BoutiqueSchema.methods = {};

/**
 * Statics
 */

BoutiqueSchema.statics = {};

const Boutique = mongoose.model("Boutique", BoutiqueSchema);

module.exports = Boutique;
