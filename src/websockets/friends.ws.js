const SecurityService = require("../services/security.service");
const UserService = require("../services/user.service");
const { WS_FRIENDS_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const userService = UserService();
	const securityService = SecurityService();
	const namespace = io.of(WS_FRIENDS_NAMESPACE);
	const connectedUsers = {};

	const getFriendsList = (friends) => ({
		online: friends
			.filter((id) => connectedUsers[id.toString()])
			.map((id) => ({
				username: connectedUsers[id.toString()]?.username,
				id: id.toString(),
			})),
		offline: friends
			.filter((id) => !connectedUsers[id.toString()])
			.map((id) => ({
				username: connectedUsers[id.toString()]?.username,
				id: id.toString(),
			})),
	});

	const handleConnection = async (socket) => {
		const token = socket.handshake.auth.token;
		const user = await securityService.getUserFromToken(token);

		if (!user) return;

		connectedUsers[user._id] = { username: user.username, socket };
		const { friends } = user;

		socket.emit("update", getFriendsList(friends));

		friends.forEach(async (friendId) => {
			const friendSocket = connectedUsers[friendId.toString()]?.socket;
			if (friendSocket) {
				const user = await userService.findOneById(friendId);
				const userFriends = getFriendsList(user.friends);
				friendSocket.emit("update", userFriends);
			}
		});

		socket.on("disconnect", () => {
			delete connectedUsers[user._id];

			friends.forEach(async (friendId) => {
				const friendSocket = connectedUsers[friendId.toString()]?.socket;
				if (friendSocket) {
					const user = await userService.findOneById(friendId);
					const userFriends = getFriendsList(user.friends);
					friendSocket.emit("update", userFriends);
				}
			});
		});
	};

	namespace.on("connection", handleConnection);
};
