const ValidationError = require("../errors/ValidationError");
const GameStats = require("../models/gameStats.model");

module.exports = () => {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const gameStat = await GameStats.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order)
					.exec();
				return gameStat;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const gameStats = await GameStats.create(data);
				return gameStats;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOneById(id) {
			try {
				const gameStats = await GameStats.findById(id);
				return gameStats;
			} catch (error) {
				throw error;
			}
		},
		async findOneByCode(code) {
			try {
				const gameStats = await GameStats.findOne({ code });
				return gameStats;
			} catch (error) {
				throw error;
			}
		},
		async replaceOne(id, newData) {
			try {
				const deleted = await this.deleteOne(id);
				const gameStats = await this.create({ ...newData, _id: id });

				return [gameStats, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const gameStats = await GameStats.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return gameStats;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await GameStats.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
	};
};
