const SecurityService = require("../services/security.service");
const LobbyService = require("../services/lobby.service");
const { WS_LOBBY_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const lobbyService = LobbyService();
	const securityService = SecurityService();
	const namespace = io.of(WS_LOBBY_NAMESPACE);

	const handleConnection = async (socket) => {
		const { code } = socket.handshake.query;
		const { token } = socket.handshake.auth;
		const lobby = await lobbyService.findOneByCode(code);

		if (!lobby) {
			socket.emit("error", "Lobby not found");
			return;
		}

		const user = await securityService.getUserFromToken(token);

		if (!user) {
			socket.emit("error", "Authentication failed");
			return;
		}

		socket.join(lobby.id);

		const players = await lobbyService.addPlayer(lobby.id, user);

		namespace.to(lobby.id).emit("notification", {
			title: "Someone's here",
			description: `${user.username} just joined the lobby`,
		});

		namespace.to(lobby.id).emit("players", players);

		// if (
		// 	lobbyUpdated &&
		// 	lobbyUpdated.players.length === lobbyUpdated.settings.questionTimeplayersMax
		// ) {
		// 	namespace.to(lobby.id).emit("game_start", lobbyUpdated.gameId);
		// 	socket.leave(lobby.id);
		// 	lobbyService.deleteOne(lobby.id);
		// }

		socket.on("vote_theme", async (themeId) => {
			console.log("vote_theme");
			const themesUpdated = await lobbyService.voteTheme({
				lobbyId: lobby.id,
				userId: user._id,
				themeId,
			});
			console.log(themesUpdated);
			if (!themesUpdated) return;
			namespace.to(lobby.id).emit("theme_voted", themesUpdated);
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
