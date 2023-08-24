const UserInvitation = require("../models/userInvitation.model");
const GameInvitation = require("../models/gameInvitation.model");
const SecurityService = require("../services/security.service");
const UserAchievement = require("../models/userAchievement.model");
const AchievementService = require("../services/achievement.service");
const { WS_USERS_NAMESPACE } = require("../utils/constants");

module.exports = (io) => {
	const securityService = SecurityService();
	const achievementService = AchievementService();
	const namespace = io.of(WS_USERS_NAMESPACE);
	const connectedUsers = {};

	const handleConnection = async (socket) => {
		const token = socket.handshake.auth.token;

		const user = await securityService.getUserFromToken(token);

		if (!user) return;

		connectedUsers[user._id] = socket;

		socket.on("disconnect", () => {
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

			recipientSocket.emit("receive_user_invitation", inviter.username);
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
			const { invitation_code, inviter, _id } = change.fullDocument;
			const invitation = {
				invitation_code,
				inviter,
				id: _id,
			};
			recipientSocket.emit("receive_game_invitation", invitation);
		} catch (error) {
			console.error(error);
		}
	});

	/* User achievement */
	UserAchievement.watch().on("change", async (change) => {
		try {
			if (change.operationType !== "update" || !change.documentKey) return;

			const updatedDocument = await UserAchievement.findById(
				change.documentKey._id
			);

			if (!updatedDocument) return;

			const updatedFields = change.updateDescription.updatedFields;

			updatedDocument.achievements.forEach(async (achievement, index) => {
				if (updatedFields && updatedFields[`achievements.${index}.achieved`]) {
					const isAchieved = achievement.achieved;

					if (!isAchieved) return;

					const achievementData = await achievementService.findOneById(
						achievement.id
					);
					const userSocket = connectedUsers[updatedDocument.userId.toString()];

					if (!userSocket) return;

					userSocket.emit("achievement_unlocked", achievementData?.label);
				}
			});
		} catch (error) {
			console.error(error);
		}
	});

	namespace.on("connection", handleConnection);
};
