const ValidationError = require("../errors/ValidationError");
const UserInvitation = require("../models/userInvitation.model");

module.exports = function () {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const invitationList = await UserInvitation.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return invitationList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const invitation = await UserInvitation.create(data);
				return invitation;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOne(id) {
			try {
				const invitation = await UserInvitation.findById(id);
				return invitation;
			} catch (error) {
				throw error;
			}
		},
		async replaceOne(id, newData) {
			try {
				const deleted = await this.deleteOne(id);
				const invitation = await this.create({ ...newData, _id: id });

				return [invitation, !deleted];
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const invitation = await UserInvitation.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return invitation;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await UserInvitation.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
	};
};
