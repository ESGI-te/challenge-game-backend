const ValidationError = require("../errors/ValidationError");
const Quizz = require("../models/quizz.model");

module.exports = function () {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const quizzList = await Quizz.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return quizzList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const quizz = await Quizz.create(data);
				return quizz;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseError(error);
				}
				throw error;
			}
		},
		async findOne(id) {
			try {
				const quizz = await Quizz.findById(id);
				return quizz;
			} catch (error) {
				throw error;
			}
		},
		async replaceOne(id, newData) {
			try {
				const deleted = await this.deleteOne(id);
				const quizz = await this.create({ ...newData, _id: id });

				return [quizz, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseError(error);
				}
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const quizz = await Quizz.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return quizz;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await Quizz.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
	};
};
