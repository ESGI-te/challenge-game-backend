const ValidationError = require("../errors/ValidationError");
const Inventory = require("../models/inventory.model");

module.exports = function () {
  return {
    // Méthode pour récupérer tous les produits en fonction des critères de recherche, pagination et tri
    async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
      try {
        const itemList = await Inventory.find(criteria)
          .limit(itemsPerPage)
          .skip((page - 1) * itemsPerPage)
          .sort(order);
        return itemList;
      } catch (error) {
        throw error;
      }
    },

    // Méthode pour créer un nouveau produit
    async create(data) {
      try {
        const item = await Inventory.create(data);
        return item;
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
        const item = await Inventory.findById(criteria);
        return item;
      } catch (error) {
        throw error;
      }
    },
    async replaceOne(id, newData) {
			try {
				const deleted = await Inventory.deleteOne(id);
				const item = await Inventory.create(newData);
				return [item, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
    // Méthode pour mettre à jour un produit existant
    async updateOne(objectId, newData) {
      try {
        const item = await Inventory.findByIdAndUpdate(
          objectId,
          {$set: {item: newData.item}},
          {new: true}
        );
        return item;
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
        await Inventory.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw error;
      }
    },
  };
};
