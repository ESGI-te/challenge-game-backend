const ValidationError = require("../errors/ValidationError");
const Lobby = require("../models/lobby.model");
const { shuffleArray } = require("../utils/helpers");
const QuizzService = require("./quizz.service");

module.exports = () => {
	const quizzService = QuizzService();

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
		async getPlayers(lobbyId) {
			try {
				const lobby = await Lobby.findOne({ _id: lobbyId }, "players");

				return lobby?.players;
			} catch (error) {
				throw error;
			}
		},
		async addPlayer(lobbyId, player) {
			const playerId = player._id;
			const username = player.username;

			try {
				const lobby = await Lobby.findOneAndUpdate(
					{ _id: lobbyId, "players.id": { $ne: playerId } },
					{ $addToSet: { players: { id: playerId, username } } },
					{ new: true }
				);

				return lobby?.players;
			} catch (error) {
				throw error;
			}
		},
		async removePlayer(lobbyId, playerId) {
			try {
				const lobby = await Lobby.findOneAndUpdate(
					{ _id: lobbyId },
					{ $pull: { players: { id: playerId } } },
					{ new: true }
				);

				return lobby?.players;
			} catch (error) {
				throw error;
			}
		},
		async voteTheme({ lobbyId, themeId, userId }) {
			try {
				const lobby = await Lobby.findOneAndUpdate(
					{
						_id: lobbyId,
						"themes.id": themeId,
						"themes.voters": { $ne: userId },
					},
					{
						$addToSet: { "themes.$.voters": userId },
					},
					{ new: true }
				);

				return lobby?.themes;
			} catch (error) {
				throw error;
			}
		},
		async setVotedTheme(lobbyId, themeId) {
			try {
				const lobby = await Lobby.findOneAndUpdate(
					{ _id: lobbyId },
					{ $set: { votedTheme: themeId } },
					{ new: true }
				);

				return lobby?.votedTheme;
			} catch (error) {
				throw error;
			}
		},
		async getQuestions({ nbQuestions, theme }) {
			try {
				const quizzs = await quizzService.findAll({ theme }, {});

				const allQuestions = quizzs.reduce((questions, quizz) => {
					return questions.concat(quizz.questions);
				}, []);

				const shuffledQuestions = shuffleArray(allQuestions);

				const selectedQuestions = shuffledQuestions.slice(0, nbQuestions);

				return selectedQuestions;
			} catch (error) {
				throw error;
			}
		},
	};
};
