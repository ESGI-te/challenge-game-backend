const SecurityService = require("../services/security.service");
const GameService = require("../services/game.service");
const { WS_GAME_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const gameService = GameService();
	const securityService = SecurityService();

	const namespace = io.of(WS_GAME_NAMESPACE);

	const handleConnection = async (socket) => {
		const gameId = socket.handshake.query["gameId"];
		const userId = socket.handshake.query["userId"];
		const token = socket.handshake.auth.token;

		const player = await securityService.getUserFromToken(token);
		const game = await gameService.addPlayer(gameId, player);

		socket.join(gameId);

		namespace.to(gameId).emit("notification", {
			title: "Someone's here",
			description: `${player.username} just joined the game`,
		});
		namespace.to(gameId).emit("players", game.players);

		// TODO: Add game events

		socket.on("disconnect", () => {
			socket.leave(gameId);
			const { players } = gameService.removePlayer(gameId, userId);
			namespace.to(gameId).emit("notification", {
				title: "Someone just left",
				description: `${player.username} just left the game`,
			});
			namespace.to(gameId).emit("players", players);
		});
	};

	namespace.on("connection", handleConnection);
};
