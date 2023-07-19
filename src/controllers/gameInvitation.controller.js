const UserService = require("../services/user.service");
const SecurityService = require("../services/security.service");
const {
	Types: { ObjectId },
} = require("mongoose");

module.exports = (Service, options = {}) => {
	const userService = UserService();
	const securityService = SecurityService();

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
				"recipient.id": user.id,
			};
			const gameInvitations = await Service.findAll(newCriteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			// TODO: Remove ids from response
			res.json(gameInvitations);
		},
		// TODO: Add verification to check if the user is already in the lobby
		async create(req, res, next) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];
				const user = await securityService.getUserFromToken(token);
				const lobbyId = req.body.lobbyId;
				const recipientUser = await userService.findOneById(req.body.userId);

				if (!recipientUser) {
					return res.status(404).json({ message: "User not found" });
				}

				const isDuplicate = await Service.findOne({
					"inviter.id": user.id,
					"recipient.id": recipientUser.id,
				});

				if (isDuplicate) {
					return res
						.status(409)
						.json({ message: "An invitation to this user already exists" });
				}

				const invitation = {
					lobbyId,
					inviter: {
						username: user.username,
						id: user.id,
					},
					recipient: {
						username: recipientUser.username,
						id: recipientUser.id,
					},
				};

				const gameInvitation = await Service.create(invitation);
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
				const invitation = await Service.findOneById(req.params.id);
				const { lobbyId } = invitation;

				if (!invitation) {
					return res.status(404).json({ message: "Invitation not found" });
				}
				const userId = new ObjectId(user.id);

				if (!userId.equals(invitation.recipient.id)) {
					return res.status(403).json({ message: "Unauthorized" });
				}

				await Service.deleteOne(req.params.id);

				res.status(200).json({ lobbyId });
			} catch (error) {
				next(error);
			}
		},
		async declineInvitation(req, res, next) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];

				const user = await securityService.getUserFromToken(token);
				const invitation = await Service.findOneById(req.params.id);

				if (!invitation) {
					return res.status(404).json({ message: "Invitation not found" });
				}
				const userId = new ObjectId(user.id);

				if (!userId.equals(invitation.recipient.id)) {
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
				const invitation = await Service.findOneById(req.params.id);

				if (!invitation) {
					return res.status(404).json({ message: "Invitation not found" });
				}

				const userId = new ObjectId(user.id);
				if (!userId.equals(invitation.inviter.id)) {
					return res.status(403).json({ message: "Unauthorized" });
				}

				await Service.deleteOne(req.params.id);

				res.status(200).json({ message: "Invitation canceled successfully" });
			} catch (error) {
				next(error);
			}
		},
	};
};
