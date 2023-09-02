const UserService = require("../services/user.service");
const SecurityService = require("../services/security.service");
const LobbyService = require("../services/lobby.service");
const UserAchievementService = require("../services/userAchievement.service");

const {
	Types: { ObjectId },
} = require("mongoose");

module.exports = (Service, options = {}) => {
	const userService = UserService();
	const securityService = SecurityService();
	const lobbyService = LobbyService();
	const userAchievementService = UserAchievementService();

	return {
		async getAll(req, res) {
			const {
				_page = 1,
				_itemsPerPage = 30,
				// _sort[id]=ASC&_sort[name]=DESC
				_sort = {},
				type,
				...criteria
			} = req.query;

			const token = req.headers["authorization"]?.split(" ")[1];
			const user = await securityService.getUserFromToken(token);
			const newCriteria = {
				...criteria,
				"inviter.id": user._id,
			};

			const gameInvitations = await Service.findAll(newCriteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});

			res.json(gameInvitations);
		},
		// TODO: Add verification to check if the user is already in the lobby
		async create(req, res, next) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];
				const user = await securityService.getUserFromToken(token);
				const invitationCode = req.body.code;
				const recipientUser = await userService.findOneById(req.body.userId);

				if (!recipientUser) {
					return res.status(404).json({ message: "User not found" });
				}

				const lobby = await lobbyService.findOneByCode(invitationCode);

				if (!lobby) {
					return res.status(404).json({ message: "Lobby not found" });
				}
				const { invitation_code } = lobby;

				const isDuplicate = await Service.findOne({
					invitation_code,
					"inviter.id": user._id,
					"recipient.id": recipientUser.id,
				});

				if (isDuplicate) {
					return res
						.status(409)
						.json({ message: "An invitation to this user already exists" });
				}

				const invitation = {
					invitation_code,
					inviter: {
						username: user.username,
						id: user._id,
					},
					recipient: {
						username: recipientUser.username,
						id: recipientUser.id,
					},
				};

				const gameInvitation = await Service.create(invitation);
				userAchievementService.updateAchievementProgress(
					user._id,
					"invite_game_1"
				);
				return res.status(201).json(gameInvitation);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const gameInvitation = await Service.findOneById(req.params.id);
			if (!gameInvitation) {
				res.sendStatus(404);
			} else {
				res.json(gameInvitation);
			}
		},
		async acceptInvitation(req, res, next) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];

				const user = await securityService.getUserFromToken(token);
				const invitation = await Service.findOneById(req.body.id);
				const { invitation_code } = invitation;

				if (!invitation) {
					return res.status(404).json({ message: "Invitation not found" });
				}

				if (!user._id === invitation.recipient.id) {
					return res.status(403).json({ message: "Unauthorized" });
				}
				await userAchievementService.updateAchievementProgress(
					user._id,
					"join_game_1"
				);
				await userAchievementService.updateAchievementProgress(
					user._id,
					"join_game_2"
				);
				await Service.deleteOne(req.body.id);

				res.status(200).json({ invitation_code });
			} catch (error) {
				next(error);
			}
		},
		async declineInvitation(req, res, next) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];

				const user = await securityService.getUserFromToken(token);
				const invitation = await Service.findOneById(req.body.id);

				if (!invitation) {
					return res.status(404).json({ message: "Invitation not found" });
				}

				if (!user._id === invitation.recipient.id) {
					return res.status(403).json({ message: "Unauthorized" });
				}

				await Service.deleteOne(req.params.id);

				res.status(200).json({ message: "Invitation declined successfully" });
			} catch (error) {
				next(error);
			}
		},
		async cancelInvitation(req, res, next) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];

				const user = await securityService.getUserFromToken(token);
				const invitation = await Service.findOneById(req.body.id);

				if (!invitation) {
					return res.status(404).json({ message: "Invitation not found" });
				}

				if (!user._id === invitation.inviter.id) {
					return res.status(403).json({ message: "Unauthorized" });
				}

				await Service.deleteOne(req.body.id);

				res.status(200).json({ message: "Invitation canceled successfully" });
			} catch (error) {
				next(error);
			}
		},
	};
};
