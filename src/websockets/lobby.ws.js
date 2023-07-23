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

		socket.emit("lobby", lobby);

		const user = await securityService.getUserFromToken(token);

		if (!user) {
			socket.emit("error", "Authentication failed");
			return;
		}

		socket.join(lobby.id);

		const lobbyUpdated = await lobbyService.addPlayer(lobby.id, user);

		namespace.to(lobby.id).emit("notification", {
			title: "Someone's here",
			description: `${user.username} just joined the lobby`,
		});

		namespace.to(lobby.id).emit("lobby", lobbyUpdated);

		if (
			lobbyUpdated &&
			lobbyUpdated.players.length === lobbyUpdated.playersMax
		) {
			namespace.to(lobby.id).emit("game_start", lobbyUpdated.gameId);
			socket.leave(lobby.id);
			lobbyService.deleteOne(lobby.id);
		}

		socket.on("new_message", (msg) => {
			namespace.to(lobby.id).emit("message", { player: user?.username, msg });
		});

		socket.on("disconnect", async () => {
			socket.leave(lobby.id);
			const lobbyUpdated = await lobbyService.removePlayer(lobby.id, user?._id);
			namespace.to(lobby.id).emit("notification", {
				title: "Someone just left",
				description: `${user?.username} just left the lobby`,
			});
			namespace.to(lobby.id).emit("lobby", lobbyUpdated);
		});
	};

	namespace.on("connection", handleConnection);
};
