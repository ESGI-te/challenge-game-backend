const SecurityService = require("../services/security.service");
const GameService = require("../services/game.service");
const LobbyService = require("../services/lobby.service");
const { WS_LOBBY_NAMESPACE } = require("../utils/constants");
const { generateUID } = require("../utils/helpers");
const UserAchievementService = require("../services/userAchievement.service");
const QuizzThemeService = require("../services/quizzTheme.service");

module.exports = (io) => {
	const lobbyService = LobbyService();
	const gameService = GameService();
	const securityService = SecurityService();
	const userAchievementService = UserAchievementService();
	const quizzThemeService = QuizzThemeService();

	const namespace = io.of(WS_LOBBY_NAMESPACE);

	let validationInProgress = new Map(); // TODO: Store the validation state in the database
	let validationTimers = new Map();

	let lobbyValidatedUsers = new Map(); // TODO: Store the validated users in the database

	const startValidation = (lobbyId) => {
		validationInProgress.set(lobbyId, true);
		const validationTime = 30;

		namespace.to(lobbyId).emit("validation_started", validationTime);

		const validationTimer = setTimeout(() => {
			endValidation(lobbyId);
		}, validationTime * 1000);

		validationTimers.set(lobbyId, validationTimer);
	};

	const endValidation = (lobbyId) => {
		validationInProgress.delete(lobbyId);

		namespace.to(lobbyId).emit("validation_ended");

		clearTimeout(validationTimers.get(lobbyId));
		validationTimers.delete(lobbyId);
		lobbyValidatedUsers.delete(lobbyId);
	};

	const startGame = async (lobbyId) => {
		endValidation(lobbyId);
		namespace.to(lobbyId).emit("game_creation_started");

		const { owner, settings, votedTheme } = await lobbyService.findOne(lobbyId);
		const { playersMax, ...gameSettings } = settings;
		const gameCode = generateUID();
		const questions = await lobbyService.getQuestions({
			nbQuestions: gameSettings.nbQuestions,
			theme: votedTheme,
		});
		const theme = await quizzThemeService.findOne(votedTheme);

		const gameData = {
			owner,
			settings: {
				...gameSettings,
				theme: {
					id: theme._id.toString(),
					name: theme.name,
				},
			},
			questions,
			code: gameCode,
		};

		const game = await gameService.create(gameData);

		if (!game) {
			namespace.to(lobbyId).emit("error", "Could not create game");
			return;
		}

		namespace.to(lobbyId).emit("game_created", gameCode);

		const timeoutId = setTimeout(() => {
			lobbyService.deleteOne(lobbyId);
			clearTimeout(timeoutId);
		}, 3000);
	};

	const chooseRandomThemeFromMostVoted = (themes) => {
		const maxVotes = Math.max(...themes.map((theme) => theme.voters.length));
		const mostVotedThemes = themes.filter(
			(theme) => theme.voters.length === maxVotes
		);
		const randomIndex = Math.floor(Math.random() * mostVotedThemes.length);
		return mostVotedThemes[randomIndex];
	};

	const handleConnection = async (socket) => {
		const { code, hasJoinByCode } = socket.handshake.query;
		const { token } = socket.handshake.auth;
		const lobby = await lobbyService.findOneByCode(code);

		if (!lobby) {
			socket.emit("error", "Lobby not found");
			return;
		}

		const user = await securityService.getUserFromToken(token);
		const isOwner = lobby.owner.toString() === user._id.toString();

		if (!user) {
			socket.emit("error", "Authentication failed");
			return;
		}

		socket.join(lobby.id);

		if (hasJoinByCode) {
			userAchievementService.updateAchievementProgress(
				user._id,
				"join_game_code_1"
			);
			userAchievementService.updateAchievementProgress(
				user._id,
				"join_game_code_2"
			);
		}

		const players = await lobbyService.addPlayer(lobby.id, user);

		namespace.to(lobby.id).emit("notification", {
			title: "Someone's here",
			description: `${user.username} just joined the lobby`,
		});

		namespace.to(lobby.id).emit("players", players);

		socket.on("vote_theme", async (themeId) => {
			const themes = await lobbyService.voteTheme({
				lobbyId: lobby.id,
				userId: user._id,
				themeId,
			});

			if (!themes) return;

			namespace.to(lobby.id).emit("theme_voted", themes);

			const players = await lobbyService.getPlayers(lobby.id);
			const allPlayersVoted = players.every((player) =>
				themes.some((theme) => theme.voters.includes(player.id))
			);

			if (!allPlayersVoted) return;

			const chosenTheme = chooseRandomThemeFromMostVoted(themes);
			const votedTheme = await lobbyService.setVotedTheme(
				lobby.id,
				chosenTheme.id
			);
			namespace.to(lobby.id).emit("all_players_voted", votedTheme);
		});

		/* Validation */
		socket.on("start_validation", () => {
			if (!isOwner || validationInProgress.has(lobby.id)) return;

			startValidation(lobby.id);
		});

		socket.on("cancel_validation", () => {
			if (!isOwner || !validationInProgress.has(lobby.id)) return;

			endValidation(lobby.id);
			namespace.to(lobby.id).emit("validation_ended");
		});

		socket.on("validate", async () => {
			if (!validationInProgress.has(lobby.id)) return;

			const validatedUsers = lobbyValidatedUsers.get(lobby.id) || new Set();
			validatedUsers.add(user._id);
			lobbyValidatedUsers.set(lobby.id, validatedUsers);

			namespace.to(lobby.id).emit("user_validated", Array.from(validatedUsers));

			const players = await lobbyService.getPlayers(lobby.id);

			if (validatedUsers.size !== players.length) return;

			startGame(lobby.id);
		});

		socket.on("new_message", (msg) => {
			namespace.to(lobby.id).emit("message", { player: user.username, msg });
		});

		socket.on("disconnect", async () => {
			socket.leave(lobby.id);
			const players = await lobbyService.removePlayer(lobby.id, user._id);

			namespace.to(lobby.id).emit("notification", {
				title: "Someone just left",
				description: `${user?.username} just left the lobby`,
			});

			namespace.to(lobby.id).emit("lobby", players);
		});
	};

	namespace.on("connection", handleConnection);
};
