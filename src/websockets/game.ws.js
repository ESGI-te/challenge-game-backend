const SecurityService = require("../services/security.service");
const GameService = require("../services/game.service");
const GameStatsService = require("../services/gameStats.service");
const HistoryService = require("../services/history.service");
const { WS_GAME_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const gameService = GameService();
	const securityService = SecurityService();
	const gameStatsService = GameStatsService();
	const historyService = HistoryService();

	const namespace = io.of(WS_GAME_NAMESPACE);

	let questionIntervals = new Map();
	let gameSettings = new Map();
	let gameQuestions = new Map();
	let currentQuestion = new Map();
	let gamePlayers = new Map();
	let gamePlayersAnswers = new Map();
	let currentQuestionStartTime = new Map();

	const emitQuestion = (gameId, question) =>
		namespace.to(gameId).emit("new_question", question);

	const startQuestionsInterval = (gameId, userId, userSocket) => {
		const questions = gameQuestions.get(gameId);
		let questionIndex = 0;
		currentQuestion.set(gameId, questions[questionIndex]);
		emitQuestion(gameId, {
			question: questions[questionIndex],
			index: questionIndex + 1,
		});
		const questionTime = gameSettings.get(gameId).questionTime;
		const firstInterval = startQuestionTimeInterval(gameId);

		const questionsInterval = setInterval(() => {
			if (
				Array.from(gamePlayers.get(gameId)).every(
					(player) => player.isConnected === false
				)
			) {
				handleGameOver(gameId, userId);
				return;
			}

			questionIndex++;

			if (questionIndex >= questions.length) {
				handleGameOver(gameId, userId);
				return;
			}

			const playersAnswers = gamePlayersAnswers.get(gameId);
			const players = gamePlayers.get(gameId);

			if (!players) return;

			let playersWithNoAnswer = Array.from(players)
				.map(([userId, data]) => ({
					userId,
					...data,
				}))
				.filter((p) => !playersAnswers.has(p.userId));

			for (const player of playersWithNoAnswer) {
				const newLives = player.lives - 1;
				players.set(player.userId, { ...player, lives: newLives });
				emitPlayers(gameId);

				if (newLives === 0) {
					userSocket.emit("player_eliminated");

					const alivePlayers = Array.from(players.values()).filter(
						(p) => p.lives > 0
					);

					if (players.size === 1 || alivePlayers.length === 1) {
						handleGameOver(gameId, userId);
						return;
					}
				}
			}

			playersAnswers.clear();
			playersWithNoAnswer = [];

			const question = questions[questionIndex];
			startQuestionTimeInterval(gameId);
			emitQuestion(gameId, { question, index: questionIndex + 1 });
			clearInterval(firstInterval);
			currentQuestion.set(gameId, question);
		}, questionTime * 1000);

		questionIntervals.set(gameId, questionsInterval);
	};

	const startQuestionTimeInterval = (gameId) => {
		const questionStartTime = Date.now();
		const questionTime = gameSettings.get(gameId).questionTime * 1000;

		const questionTimeInterval = setInterval(() => {
			const currentTime = Date.now();
			const elapsedTime = currentTime - questionStartTime;

			const questionTimeLeft = questionTime - elapsedTime;

			if (questionTimeLeft <= 0) {
				clearInterval(questionTimeInterval);
			}

			namespace.to(gameId).emit("question_time_left", questionTimeLeft);
		}, 100);

		currentQuestionStartTime.set(gameId, questionTimeInterval);

		return questionTimeInterval;
	};

	const clearGameData = (gameId) => {
		const questionInterval = questionIntervals.get(gameId);
		clearInterval(questionInterval);
		questionIntervals.delete(gameId);
		gameSettings.delete(gameId);
		gameQuestions.delete(gameId);
		currentQuestion.delete(gameId);
		gamePlayers.delete(gameId);
		currentQuestionStartTime.delete(gameId);
	};

	const emitPlayers = (gameId) => {
		const players = gamePlayers.get(gameId);

		namespace.to(gameId).emit(
			"players",
			Array.from(players).map(([userId, data]) => ({ userId, ...data }))
		);
	};

	const calculatePoints = (questionTime, answerTime) => {
		return Math.floor((questionTime * 1000 - answerTime) / 1000);
	};

	const calculateRank = (gameId) => {
		const players = gamePlayers.get(gameId);

		const playersArray = Array.from(players).map(([userId, data]) => ({
			userId,
			score: data.score,
		}));

		playersArray.sort((a, b) => b.score - a.score);

		let rank = 1;
		for (let i = 0; i < playersArray.length; i++) {
			const player = playersArray[i];
			const nextPlayer = playersArray[i + 1];

			player.rank = rank;

			if (nextPlayer && nextPlayer.score !== player.score) {
				rank++;
			}
		}

		for (const player of playersArray) {
			const originalPlayer = players.get(player.userId);
			players.set(player.userId, { ...originalPlayer, rank: player.rank });
		}
	};

	const incrementScore = ({ gameId, userId, answerTime }) => {
		const players = gamePlayers.get(gameId);
		const player = players.get(userId);
		const score = player.score;
		const questionTime = gameSettings.get(gameId).questionTime;
		const newScore = score + calculatePoints(questionTime, answerTime);
		players.set(userId, { ...player, score: newScore });
		calculateRank(gameId);
		emitPlayers(gameId);
	};

	const checkAnswer = ({ gameId, userId, answer, answerTime, userSocket }) => {
		const playersAnswers = gamePlayersAnswers.get(gameId);
		playersAnswers.add(userId);
		const question = currentQuestion.get(gameId);
		const isCorrect = question.answer === answer;

		if (!isCorrect) {
			const players = gamePlayers.get(gameId);
			const player = players.get(userId);

			if (player.lives === 0) return;

			const newLives = player.lives - 1;
			players.set(userId, { ...player, lives: newLives });

			emitPlayers(gameId);

			if (newLives === 0) {
				userSocket.emit("player_eliminated");
				console.log(newLives);
				const alivePlayers = Array.from(players.values()).filter(
					(p) => p.lives > 0
				);

				if (players.size === 1 || alivePlayers.length === 1) {
					handleGameOver(gameId, userId);
					return;
				}
			}
		} else incrementScore({ gameId, userId, answerTime });

		userSocket.emit("answer_is_correct", isCorrect);
	};

	const initializeGame = (game, userId, userSocket) => {
		gameSettings.set(game.id, game.settings);
		gameQuestions.set(game.id, game.questions);
		gamePlayers.set(game.id, new Map());
		gamePlayersAnswers.set(game.id, new Set());
		currentQuestionStartTime.set(game.id, null);

		// Delay the start of the game by 6 seconds to let the players join the game
		const timeoutId = setTimeout(() => {
			startQuestionsInterval(game.id, userId, userSocket);
			clearTimeout(timeoutId);
		}, 6000);
	};

	const initializePlayer = async (gameId, user) => {
		await gameService.addPlayer(gameId, user);
		const players = gamePlayers.get(gameId);
		const newPlayer = {
			score: 0,
			lives: gameSettings.get(gameId).lives,
			rank: players.size + 1,
			username: user.username,
			isConnected: true,
		};
		players.set(user._id.toString(), newPlayer);
		emitPlayers(gameId);
	};

	const handlePlayerReconnection = (gameId, userSocket, userId) => {
		const question = currentQuestion.get(gameId);
		const questionIndex = gameQuestions.get(gameId).indexOf(question);
		const players = gamePlayers.get(gameId);
		const player = players.get(userId);
		players.set(userId, { ...player, isConnected: true });
		const hasAnswered = gamePlayersAnswers.get(gameId).has(userId);

		userSocket.emit("new_question", { question, index: questionIndex + 1 });
		userSocket.emit(
			"players",
			Array.from(players).map(([userId, data]) => ({ userId, ...data }))
		);
		userSocket.emit("has_answered", hasAnswered);
	};

	const handleGameOver = async (gameId, userId) => {
		const player = gamePlayers.get(gameId).get(userId);
		const game = await gameService.findOne(gameId);
		const gameStatsData = {
			gameSettings: game.settings,
			code: game.code,
			players: Array.from(gamePlayers.get(gameId)).map(
				([userId, { username, score, lives, rank }]) => ({
					id: userId,
					username,
					score,
					lives,
					rank,
				})
			),
			createdAt: game.createdAt,
		};
		const gameStats = await gameStatsService.create(gameStatsData);
		const historyEntry = {
			userId,
			gameStatsId: gameStats._id,
			code: game.code,
			rank: player.rank,
			score: player.score,
			lives: player.lives,
			createdAt: game.createdAt,
		};
		await historyService.addHistoryEntry(userId, historyEntry);
		clearGameData(gameId);
		namespace.to(gameId).emit("game_over", gameStats._id.toString());
		gameService.deleteOne(gameId);
	};

	const handleConnection = async (socket) => {
		const { code } = socket.handshake.query;
		const { token } = socket.handshake.auth;
		const game = await gameService.findOneByCode(code);

		if (!game) {
			socket.emit("error", "Game not found");
			return;
		}

		const user = await securityService.getUserFromToken(token);

		if (!user) {
			socket.emit("error", "Authentication failed");
			return;
		}

		const isGameExist = gameSettings.has(game.id) && gameQuestions.has(game.id);

		const isNewUser = !gamePlayers.get(game.id)?.has(user._id.toString());

		socket.join(game.id);

		if (!isGameExist) {
			initializeGame(game, user._id.toString(), socket);
		}
		if (isNewUser) {
			initializePlayer(game.id, user);
		} else {
			handlePlayerReconnection(game.id, socket, user._id.toString());
		}

		namespace.to(game.id).emit("notification", {
			title: "Someone's here",
			description: `${user.username} just joined the game`,
		});

		socket.on("answer_question", ({ answer, answerTime }) => {
			checkAnswer({
				gameId: game.id,
				userId: user._id.toString(),
				answer,
				answerTime,
				userSocket: socket,
			});
		});

		socket.on("disconnect", async () => {
			socket.leave(game.id);
			const players = gamePlayers.get(game.id);
			const player = players.get(user._id.toString());
			players.set(user._id.toString(), { ...player, isConnected: false });
			emitPlayers(game.id);
		});
	};

	namespace.on("connection", handleConnection);
};
