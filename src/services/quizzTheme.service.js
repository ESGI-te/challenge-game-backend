const ValidationError = require("../errors/ValidationError");
const QuizzTheme = require("../models/quizzTheme.model");

module.exports = () => {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const quizzThemeList = await QuizzTheme.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return quizzThemeList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const quizzTheme = await QuizzTheme.create(data);
				return quizzTheme;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOne(id) {
			try {
				const quizzTheme = await QuizzTheme.findById(id);
				return quizzTheme;
			} catch (error) {
				throw error;
			}
		},
		async replaceOne(id, newData) {
			try {
				const deleted = await this.deleteOne(id);
				const quizzTheme = await this.create({ ...newData, _id: id });

				return [quizzTheme, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const quizzTheme = await QuizzTheme.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return quizzTheme;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await QuizzTheme.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
	};
};
