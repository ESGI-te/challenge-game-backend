const UserInvitationService = require("../services/userInvitation.service");
const SecurityService = require("../services/security.service");
const UserService = require("../services/user.service");
const { WS_FRIEND_INVITATION_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const userInvitationService = UserInvitationService();
	const userService = UserService();
	const securityService = SecurityService();

	const namespace = io.of(WS_FRIEND_INVITATION_NAMESPACE);

	const connectedUsers = {};

	const handleConnection = async (socket) => {
		const userId = socket.handshake.query["userId"];
		const token = socket.handshake.auth.token;

		const user = await securityService.getUserFromToken(token);

		if (!user) return;

		connectedUsers[userId] = socket;

		socket.join(userId);

		socket.on("send_invitation", async (username) => {
			const recipientUser = await userService.findOne({ username });

			if (!recipientUser) {
				socket.emit("user_not_found");
				return;
			}

			const data = {
				inviter: {
					username: user.username,
					id: user.id,
				},
				recipient: {
					username: recipientUser.username,
					id: recipientUser.id,
				},
			};
			const invitation = await userInvitationService.create(data);
			const recipientSocket = connectedUsers[recipientUser.id];

			if (!recipientSocket) return;

			recipientSocket.emit("receive_invitation", invitation);
		});

		socket.on(
			"accept_invitation",
			async (invitationId, inviterId, recipientUsername) => {
				const inviterSocket = connectedUsers[inviterId];
				if (!inviterSocket) return;
				inviterSocket.emit(
					"invitation_accepted",
					`${recipientUsername} accepted your invitation`
				);
				await userInvitationService.deleteOne(invitationId);
			}
		);

		socket.on(
			"reject_invitation",
			async (invitationId, inviterId, recipientUsername) => {
				const inviterSocket = connectedUsers[inviterId];
				if (!inviterSocket) return;
				inviterSocket.emit(
					"invitation_rejected",
					`${recipientUsername} rejected your invitation`
				);
				await userInvitationService.deleteOne(invitationId);
			}
		);

		socket.on("disconnect", () => {
			socket.leave(userId);
			delete connectedUsers[userId];
		});
	};

	namespace.on("connection", handleConnection);
};
