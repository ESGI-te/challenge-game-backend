const UserInvitation = require("../models/userInvitation.model");
const GameInvitation = require("../models/gameInvitation.model");
const SecurityService = require("../services/security.service");
const UserService = require("../services/user.service");
const { WS_USERS_NAMESPACE } = require("../utils/constants");
const { debounce } = require("../utils/helpers");

module.exports = (io) => {
	const userService = UserService();
	const securityService = SecurityService();

	const namespace = io.of(WS_USERS_NAMESPACE);

	const connectedUsers = {};

	const handleConnection = async (socket) => {
		const token = socket.handshake.auth.token;

		const user = await securityService.getUserFromToken(token);

		if (!user) return;

		connectedUsers[user._id] = socket;

		socket.join(user._id);

		socket.on("disconnect", () => {
			socket.leave(user._id);
			delete connectedUsers[user._id];
		});
	};

	/* User invitation */
	UserInvitation.watch().on("change", async (change) => {
		try {
			if (change.operationType !== "insert" || !change.fullDocument) return;
			const { recipient, inviter } = change.fullDocument;
			const recipientSocket = connectedUsers[recipient.id];

			if (!recipientSocket) return;

			recipientSocket.emit("receive_invitation", inviter.username);
		} catch (error) {
			console.error(error);
		}
	});

	/* Game invitation */
	GameInvitation.watch().on("change", async (change) => {
		try {
			if (change.operationType !== "insert" || !change.fullDocument) return;
			const { recipient } = change.fullDocument;
			const recipientSocket = connectedUsers[recipient.id];

			if (!recipientSocket) return;

			recipientSocket.emit("receive_game_invitation", change.fullDocument);
		} catch (error) {
			console.error(error);
		}
	});

	namespace.on("connection", handleConnection);
};
