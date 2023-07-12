const UserService = require("../services/user.service");
const LobbyService = require("../services/lobby.service");
const { WS_LOBBY_NAMESPACE } = require("../utils/constants");

module.exports = function (io) {
	const userService = new UserService();
	const lobbyService = new LobbyService();

	io.of(WS_LOBBY_NAMESPACE).on("connection", async (socket) => {
		const lobbyId = socket.handshake.query["lobbyId"];
		const userId = socket.handshake.query["userId"];

		const player = await userService.findOneById(userId);
		const lobby = await lobbyService.addPlayer(lobbyId, userId);

		if (!lobby) socket.leave(lobbyId);
		else socket.join(lobbyId);

		io.to(lobbyId).emit("player_joined", player.username);

		if (lobby.players.length === lobby.playersMax) {
			io.to(lobbyId).emit("game_start", lobby.gameId);
			socket.leave(lobbyId);
			lobbyService.deleteOne(lobbyId);
		}

		// TODO: Add chat
		// socket.on("new_message", (id, msg) => {
		// 	io.to(lobbyId).emit(`${player.username} says ${msg}`);
		// });

		socket.on("disconnect", async () => {
			socket.leave(lobbyId);
			await lobbyService.removePlayer(lobbyId, userId);
			io.to(lobbyId).emit("player_left", player.username);
		});
	});
};
