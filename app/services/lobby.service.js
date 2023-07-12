const ValidationError = require("../errors/ValidationError");
const Lobby = require("../models/lobby.model");

module.exports = function () {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const lobbyList = await Lobby.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return lobbyList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const lobby = await Lobby.create(data);
				return lobby;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOne(id) {
			try {
				const lobby = await Lobby.findById(id);
				return lobby;
			} catch (error) {
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const lobby = await Lobby.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return lobby;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await Lobby.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
		async addPlayer(lobbyId, player) {
			const playerFormatted = { username: player.username, id: player.id };

			try {
				const lobby = await Lobby.findOneAndUpdate(
					{ _id: lobbyId, players: { $ne: player } },
					{ $push: { players: playerFormatted } },
					{ new: true }
				);

				return lobby;
			} catch (error) {
				throw error;
			}
		},
		async removePlayer(lobbyId, player) {
			const playerFormatted = { username: player.username, id: player.id };

			try {
				const lobby = await Lobby.findOneAndUpdate(
					{ _id: lobbyId },
					{ $pull: { players: playerFormatted } },
					{ new: true }
				);
				return lobby;
			} catch (error) {
				throw error;
			}
		},
	};
};
