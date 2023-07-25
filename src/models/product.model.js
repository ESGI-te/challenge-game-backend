const mongoose = require("mongoose");

/**
 * User schema
 */

const ProductSchema = new mongoose.Schema({
  id: {type: Number,required: true},
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 }, // -1 = une infinité
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

// Exemple de création d'un produit
// const nouveauProduit = new Produit({
//   nom: 'Produit Mixte',
//   description: 'Ceci est un produit avec un prix en euros et en gemmes',
//   prix: {
//     argent: 19.99,
//     pointsCultures: 100,
//   },
//   quantiteEnStock: 50,
// });

// // Sauvegarder le produit dans la base de données
// nouveauProduit.save()
//   .then((produit) => {
//     console.log('Produit sauvegardé :', produit);
//   })
//   .catch((err) => {
//     console.error('Erreur lors de la sauvegarde du produit :', err);
//   });

//   // Exemple de création d'un produit
// const nouveauProduit2 = new Produit({
//   nom: 'Produit Infini',
//   description: 'Ceci est un produit avec un prix en euros et en gemmes',
//   prix: {
//     argent: 19.99,
//     pointsCultures: 100,
//   },
// });

// // Sauvegarder le produit dans la base de données
// nouveauProduit2.save()
//   .then((produit) => {
//     console.log('Produit sauvegardé :', produit);
//   })
//   .catch((err) => {
//     console.error('Erreur lors de la sauvegarde du produit :', err);
//   });

module.exports = Produit;
