const mongoose = require("mongoose");

/**
 * User schema
 */

const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String },
  prix: { type: Number, required: true },
  quantite: { type: Number, default: 0 },
});


/**
 * Methods
 */

ProduitSchema.methods = {};

/**
 * Statics
 */

ProduitSchema.statics = {};

const Produit = mongoose.model("Produit", ProduitSchema);

module.exports = Produit;
