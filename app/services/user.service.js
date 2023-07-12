const ValidationError = require("../errors/ValidationError");
const User = require("../models/user.model");

module.exports = function () {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const userList = await User.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return userList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const user = await User.create(data);
				return user;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOneById(id) {
			try {
				const user = await User.findById(id);
				return user;
			} catch (error) {
				throw error;
			}
		},
		async findOne(criteria) {
			try {
				const user = await User.findOne(criteria);
				return user;
			} catch (error) {
				throw error;
			}
		},
		async replaceOne(id, newData) {
			try {
				const deleted = await this.deleteOne(id);
				const user = await this.create({ ...newData, _id: id });

				return [user, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const user = await User.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return user;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await User.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
	};
};
