/* eslint-disable no-useless-catch */
const ValidationError = require("../errors/ValidationError");
const Game = require("../models/game.model");
const QuizzTheme = require("../models/quizzTheme.model");

module.exports = function () {
	return {
		async findAll(criteria, { page = null, itemsPerPage = null, order = {} }) {
			try {
				const gameList = await Game.find(criteria)
					.limit(itemsPerPage)
					.skip((page - 1) * itemsPerPage)
					.sort(order);
				return gameList;
			} catch (error) {
				throw error;
			}
		},
		async create(data) {
			try {
				const game = await Game.create(data);
				return game;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async findOne(id) {
			try {
				const game = await Game.findById(id);
				return game;
			} catch (error) {
				throw error;
			}
		},
		async updateOne(id, newData) {
			try {
				const game = await Game.findByIdAndUpdate(id, newData, {
					new: true,
				});
				return game;
			} catch (error) {
				if (error.name === "ValidationError") {
					throw ValidationError.createFromMongooseValidationError(error);
				}
				throw error;
			}
		},
		async deleteOne(id) {
			try {
				await Game.findByIdAndDelete(id);
				return true;
			} catch (error) {
				throw error;
			}
		},
		async addPlayer(gameId, player) {
			const playerId = player._id;
			const username = player.username;

			try {
				const game = await Game.findOneAndUpdate(
					{ _id: gameId, "players.id": { $ne: playerId } },
					{
						$addToSet: {
							players: {
								id: playerId,
								username: username,
							},
						},
					},
					{ new: true }
				);

				return game?.players;
			} catch (error) {
				throw error;
			}
		},
		async findOneByCode(code) {
			try {
				const game = await Game.findOne({ code });
				return game;
			} catch (error) {
				throw error;
			}
		},
		async removePlayer(gameId, playerId) {
			try {
				const game = await Game.findOneAndUpdate(
					{ _id: gameId },
					{ $pull: { players: { id: playerId } } },
					{ new: true }
				);
				return game?.players;
			} catch (error) {
				throw error;
			}
		},
	};
};
