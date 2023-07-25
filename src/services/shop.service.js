const ValidationError = require("../errors/ValidationError");
const Produit = require("../models/produit.model");

module.exports = function () {
  return {
    // Méthode pour récupérer tous les produits en fonction des critères de recherche, pagination et tri
    async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
      try {
        const productList = await Produit.find(criteria)
          .limit(itemsPerPage)
          .skip((page - 1) * itemsPerPage)
          .sort(order);
        return productList;
      } catch (error) {
        throw error;
      }
    },

    // Méthode pour créer un nouveau produit
    async create(data) {
      try {
        const produit = await Produit.create(data);
        return produit;
      } catch (error) {
        // Si une erreur de validation Mongoose est levée, nous la transformons en une erreur personnalisée
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseValidationError(error);
        }
        throw error;
      }
    },

    // Méthode pour récupérer un produit par son ID
    async findOne(criteria) {
      try {
        const produit = await Produit.findOne(criteria);
        return produit;
      } catch (error) {
        throw error;
      }
    },
     // Méthode pour récupérer un produit par son ID
     async findOneById(id) {
      try {
        const produit = await Produit.findById(id);
        return produit;
      } catch (error) {
        throw error;
      }
    },
    async replaceOne(id, newData) {
			try {
				const deleted = await Produit.deleteOne(id);
				const product = await Produit.create(newData);
				return [product, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
    // Méthode pour mettre à jour un produit existant
    async updateOne(id, newData) {
			const objectId = mongoose.Types.ObjectId(id)

      try {
        const produit = await Produit.findByIdAndUpdate(objectId, newData, {
          new: true, // Retourne le produit mis à jour
        });
        return produit;
      } catch (error) {
        // Si une erreur de validation Mongoose est levée, nous la transformons en une erreur personnalisée
        if (error.name === "ValidationError") {
          throw ValidationError.createFromMongooseValidationError(error);
        }
        throw error;
      }
    },

    // Méthode pour supprimer un produit par son ID
    async deleteOne(id) {
      try {
        await Produit.deleteOne(id);
        return true;
      } catch (error) {
        throw error;
      }
    },
  };
};
