const { default: mongoose } = require("mongoose");
const ValidationError = require("../errors/ValidationError");
const Lobby = require("../models/lobby.model");

module.exports = () => {
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
				console.log(error);
			}
		},
		async findOneByCode(code) {
			try {
				const lobby = await Lobby.findOne({ invitation_code: code });
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
			const playerId = player.id;
			const username = player.username;

			try {
				if (!mongoose.Types.ObjectId.isValid(lobbyId)) {
					throw new Error("Invalid lobbyId");
				}

				const lobby = await Lobby.findOneAndUpdate(
					{ _id: lobbyId, "players.id": { $ne: playerId } },
					{ $addToSet: { players: { id: playerId, username } } },
					{ new: true }
				);

				return lobby;
			} catch (error) {
				throw error;
			}
		},
		async removePlayer(lobbyId, playerId) {
			try {
				if (!mongoose.Types.ObjectId.isValid(lobbyId)) {
					throw new Error("Invalid lobbyId");
				}
				const lobby = await Lobby.findOneAndUpdate(
					{ _id: lobbyId },
					{ $pull: { players: { id: playerId } } },
					{ new: true }
				);

				return lobby;
			} catch (error) {
				throw error;
			}
		},
	};
};
