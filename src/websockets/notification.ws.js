const SecurityService = require("../services/security.service");
const UserService = require("../services/user.service");
const { WS_USERS_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const userService = UserService();
	const securityService = SecurityService();

	const namespace = io.of(WS_USERS_NAMESPACE);

	const connectedUsers = {};

	const handleConnection = async (socket) => {
		const token = socket.handshake.auth.token;

		const user = await securityService.getUserFromToken(token);

		if (!user) return;

		connectedUsers[user.id] = socket;

		socket.join(user.id);

		socket.on("send_invitation", async (username) => {
			const recipientUser = await userService.findOne({ username });

			if (!recipientUser) {
				return;
			}

			const recipientSocket = connectedUsers[recipientUser.id];

			if (!recipientSocket) return;

			recipientSocket.emit("receive_invitation", user.username);
		});

		socket.on("disconnect", () => {
			socket.leave(user.id);
			delete connectedUsers[user.id];
		});
	};

	namespace.on("connection", handleConnection);
};
