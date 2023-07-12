const UserInvitationService = require("../services/userInvitation.service");
const SecurityService = require("../services/security.service");
const UserService = require("../services/user.service");
const { WS_FRIEND_INVITATION_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const userInvitationService = new UserInvitationService();
	const userService = new UserService();
	const securityService = new SecurityService();

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
			const invitedUser = await userService.findOne({ username });
			if (!invitedUser) return;
			const recipientSocket = connectedUsers[invitedUser.id];
			const data = {
				inviter: {
					username: user.username,
					id: user.id,
				},
				invited: {
					username: invitedUser.username,
					id: invitedUser.id,
				},
			};
			const invitation = await userInvitationService.create(data);

			if (!recipientSocket) return;
			recipientSocket.emit("receive_invitation", invitation);
		});

		socket.on(
			"accept_invitation",
			async (invitationId, inviterId, invitedUsername) => {
				const inviterSocket = connectedUsers[inviterId];
				if (!inviterSocket) return;
				inviterSocket.emit(
					"invitation_accepted",
					`${invitedUsername} accepted your invitation`
				);
				await userInvitationService.deleteOne(invitationId);
			}
		);

		socket.on(
			"reject_invitation",
			async (invitationId, inviterId, invitedUsername) => {
				const inviterSocket = connectedUsers[inviterId];
				if (!inviterSocket) return;
				inviterSocket.emit(
					"invitation_rejected",
					`${invitedUsername} rejected your invitation`
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
