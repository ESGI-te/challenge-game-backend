const ValidationError = require("../errors/ValidationError");
const Inventory = require("../models/inventory.model");

module.exports = function () {
	return {
		// Méthode pour récupérer tous les produits en fonction des critères de recherche, pagination et tri
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const Inventorys = await Inventory.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return Inventorys;
			} catch (error) {
				throw error;
			}
		},
		// Méthode pour créer un nouveau inventaire
		async create(data) {
			try {
				const inventory = await Inventory.create(data);
				return inventory;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		// Méthode pour récupérer un inventaire par son ID
		async findOne(criteria) {
			try {
				const inventaire = await Inventory.findById(criteria);
				return inventaire;
			} catch (error) {
				throw error;
			}
		},

		async findOneByUser(userId) {
			try {
				const inventaire = await Inventory.findOne({ userId });
				return inventaire;
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
		// Méthode pour mettre à jour un inventaire existant
		async updateOne(objectId, newData) {
			try {
				const item = await Inventory.findByIdAndUpdate(
					objectId,
					{ $addToSet: newData },
					{ new: true }
				);
				return item;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},

		async addTheme(objectId, newData) {
			try {
				const themes = await Inventory.findByIdAndUpdate(
					objectId,
					{ $set: { themes: newData.themes } },
					{ new: true }
				);
				return themes;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},

		// async addThemePack(objectId, newData) {
		//   try {
		//     const themePacks = await Inventory.findByIdAndUpdate(
		//       objectId,
		//       {$set: {theme_packs: newData.theme_packs}},
		//       {new: true}
		//     );
		//     return themePacks;
		//   } catch (error) {
		//     if (error.name === "ValidationError") {
		//       throw ValidationError.createFromMongooseValidationError(error);
		//     }
		//     throw error;
		//   }
		// },

		// Méthode pour supprimer un inventaire par son ID
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
