const SecurityService = require("../services/security.service");
const LobbyService = require("../services/lobby.service");
const { WS_LOBBY_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const lobbyService = LobbyService();
	const securityService = SecurityService();
	const namespace = io.of(WS_LOBBY_NAMESPACE);

	const handleConnection = async (socket) => {
		const { lobbyId } = socket.handshake.query;
		const { token } = socket.handshake.auth;
		const lobby = await lobbyService.findOne(lobbyId);

		if (!lobby) {
			socket.emit("error", "Lobby not found");
			return;
		}

		socket.emit("lobby", lobby);

		const player = await securityService.getUserFromToken(token);

		if (!player) {
			socket.emit("error", "Authentication failed");
			return;
		}

		socket.join(lobbyId);

		const lobbyUpdated = await lobbyService.addPlayer(lobbyId, player);

		namespace.to(lobbyId).emit("notification", {
			title: "Someone's here",
			description: `${player.username} just joined the lobby`,
		});

		namespace.to(lobbyId).emit("lobby", lobbyUpdated);

		if (
			lobbyUpdated &&
			lobbyUpdated.players.length === lobbyUpdated.playersMax
		) {
			namespace.to(lobbyId).emit("game_start", lobbyUpdated.gameId);
			socket.leave(lobbyId);
			lobbyService.deleteOne(lobbyId);
		}

		socket.on("new_message", (msg) => {
			namespace.to(lobbyId).emit("message", { player: player?.username, msg });
		});

		socket.on("disconnect", async () => {
			socket.leave(lobbyId);
			const lobbyUpdated = await lobbyService.removePlayer(lobbyId, player?.id);
			namespace.to(lobbyId).emit("notification", {
				title: "Someone just left",
				description: `${player?.username} just left the lobby`,
			});
			namespace.to(lobbyId).emit("lobby", lobbyUpdated);
		});
	};

	namespace.on("connection", handleConnection);
};
