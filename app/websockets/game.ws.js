const UserService = require("../services/user.service");
const RoomService = require("../services/lobby.service");
const { WS_GAME_NAMESPACE } = require("../utils/constants");

module.exports = function (io) {
	const userService = new UserService();
	const gameService = new RoomService();

	io.of(WS_GAME_NAMESPACE).on("connection", async (socket) => {
		const gameId = socket.handshake.query["gameId"];
		const userId = socket.handshake.query["userId"];

		const user = await userService.findOneById(userId);
		const game = await gameService.addPlayer(gameId, userId);

		if (!game) socket.leave(gameId);
		else socket.join(gameId);

		io.to(gameId).emit("player_joined", user.username);

		// TODO: Add game events

		socket.on("disconnect", () => {
			socket.leave(gameId);
			gameService.removePlayer(gameId, userId);
			io.to(gameId).emit("player_left", user.username);
		});
	});
};
