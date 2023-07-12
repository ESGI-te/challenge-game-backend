const SecurityService = require("../services/security.service");
const LobbyService = require("../services/lobby.service");
const { WS_LOBBY_NAMESPACE } = require("../utils/constants");

module.exports = function (io) {
	const lobbyService = new LobbyService();
	const securityService = new SecurityService();

	const namespace = io.of(WS_LOBBY_NAMESPACE);

	const handleConnection = async (socket) => {
		const lobbyId = socket.handshake.query["lobbyId"];
		const userId = socket.handshake.query["userId"];
		const token = socket.handshake.auth.token;

		const player = await securityService.getUserFromToken(token);
		const lobby = await lobbyService.addPlayer(lobbyId, player);

		socket.join(lobbyId);

		namespace.to(lobbyId).emit("notification", {
			title: "Someone's here",
			description: `${player.username} just joined the lobby`,
		});

		namespace.to(lobbyId).emit("players", lobby.players);

		if (lobby.players.length === lobby.playersMax) {
			namespace.to(lobbyId).emit("game_start", lobby.gameId);
			socket.leave(lobbyId);
			lobbyService.deleteOne(lobbyId);
		}

		socket.on("new_message", (msg) => {
			namespace.to(lobbyId).emit("message", { player: player.username, msg });
		});

		socket.on("disconnect", async () => {
			socket.leave(lobbyId);
			const { players } = await lobbyService.removePlayer(lobbyId, userId);
			namespace.to(lobbyId).emit("notification", {
				title: "Someone just left",
				description: `${player.username} just left the lobby`,
			});
			namespace.to(lobbyId).emit("players", players);
		});
	};

	namespace.on("connection", handleConnection);
};
