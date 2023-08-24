const ValidationError = require("../errors/ValidationError");
const Achievement = require("../models/achievement.model");

module.exports = () => {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const achievementList = await Achievement.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return achievementList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const achievement = await Achievement.create(data);
				return achievement;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOne(criteria) {
			try {
				const achievement = await Achievement.findOne(criteria);
				return achievement;
			} catch (error) {
				throw error;
			}
		},
		async findOneById(id) {
			try {
				const achievement = await Achievement.findById(id);
				return achievement;
			} catch (error) {
				throw error;
			}
		},
		async replaceOne(id, newData) {
			try {
				const deleted = await this.deleteOne(id);
				const achievement = await this.create({ ...newData, _id: id });

				return [achievement, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const achievement = await Achievement.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return achievement;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await Achievement.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
	};
};
