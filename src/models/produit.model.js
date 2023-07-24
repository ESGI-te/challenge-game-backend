const mongoose = require("mongoose");

/**
 * User schema
 */

const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: true },
  prix: {
    argent: { type: Number, default: 0 }, // Prix en euros
    pointsCultures: { type: Number, default: 0 }, // Prix en gemmes
  },
  quantiteEnStock: { type: Number, default: -1 }, // -1 = une infinité
});

/**
 * Methods
 */

produitSchema.methods = {};

/**
 * Statics
 */

produitSchema.statics = {};

const Produit = mongoose.model("Product", produitSchema);

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
