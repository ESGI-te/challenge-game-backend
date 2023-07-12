const ValidationError = require("../errors/ValidationError");
const Room = require("../models/game.model");

module.exports = function () {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const roomList = await Room.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return roomList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const room = await Room.create(data);
				return room;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOne(id) {
			try {
				const room = await Room.findById(id);
				return room;
			} catch (error) {
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const room = await Room.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return room;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await Room.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
		async addPlayer(lobbyId, userId) {
			try {
				const lobby = await Room.findOneAndUpdate(
					{ _id: lobbyId, players: { $ne: userId } },
					{ $push: { players: userId } },
					{ new: true }
				);

				return lobby;
			} catch (error) {
				throw error;
			}
		},
		async removePlayer(roomId, userId) {
			try {
				await Room.findOneAndUpdate(
					{ _id: roomId },
					{ $pull: { players: userId } },
					{ new: true }
				);
			} catch (error) {
				throw error;
			}
		},
	};
};
