const dayjs = require("dayjs");
const ValidationError = require("../errors/ValidationError");
const Stats = require("../models/gameStats.model");

module.exports = () => {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const gameStat = await Stats.find(criteria)
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
				const stat = await Stats.create(data);
				return stat;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOneById(id) {
			try {
				const stat = await Stats.findById(id);
				return stat;
			} catch (error) {
				throw error;
			}
		},
		async replaceOne(id, newData) {
			try {
				const deleted = await this.deleteOne(id);
				const stat = await this.create({ ...newData, _id: id });

				return [stat, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const stat = await Stats.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return stat;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await Stats.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
	};
};
