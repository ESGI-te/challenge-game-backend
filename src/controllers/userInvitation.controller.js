const UserService = require("../services/user.service");
const SecurityService = require("../services/security.service");

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

			const authHeader = req.headers["authorization"];
			const token = authHeader && authHeader.split(" ")[1];
			const user = await securityService.getUserFromToken(token);
			const userType = type === "requested" ? "inviter.id" : "recipient.id";
			const newCriteria = {
				...criteria,
				[userType]: user._id,
			};
			const userInvitations = await Service.findAll(newCriteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			// TODO: Remove ids from response
			res.json(userInvitations);
		},
		async create(req, res, next) {
			try {
				const authHeader = req.headers["authorization"];
				const token = authHeader && authHeader.split(" ")[1]; // Remove Bearer from string
				const user = await securityService.getUserFromToken(token);

				if (user.username === req.body.username) {
					return res.status(400).json({ message: "You can't invite yourself" });
				}

				const recipientUser = await userService.findOne({
					username: req.body.username,
				});

				if (!recipientUser) {
					return res.status(404).json({ message: "User not found" });
				}

				const isFriend = recipientUser.friends.includes(new ObjectId(user._id));

				if (isFriend) {
					return res
						.status(400)
						.json({ message: "You are already friend with this user" });
				}

				const isDuplicate = await Service.findOne({
					"inviter.id": user._id,
					"recipient.id": recipientUser.id,
				});

				if (isDuplicate) {
					return res
						.status(409)
						.json({ message: "An invitation to this user already exists" });
				}

				const invitation = {
					inviter: {
						username: user.username,
						id: user._id,
					},
					recipient: {
						username: recipientUser.username,
						id: recipientUser.id,
					},
				};

				const userInvitation = await Service.create(invitation);

				return res.status(201).json(userInvitation);
			} catch (error) {
				next(error);
			}
		},

		async getOne(req, res) {
			const userInvitation = await Service.findOneById(req.params.id);
			if (!userInvitation) {
				res.sendStatus(404);
			} else {
				res.json(userInvitation);
			}
		},
		async replace(req, res, next) {
			try {
				const [userInvitation, created] = await Service.replaceOne(
					req.params.id,
					req.body
				);

				if (!userInvitation) {
					res.sendStatus(404);
				} else res.status(created ? 201 : 200).json(userInvitation);
			} catch (error) {
				next(error);
			}
		},
		async update(req, res, next) {
			try {
				const userInvitation = await Service.updateOne(req.params.id, req.body);
				if (!userInvitation) {
					res.sendStatus(404);
				} else res.json(userInvitation);
			} catch (error) {
				next(error);
			}
		},
		async delete(req, res) {
			const deleted = await Service.deleteOne(req.params.id);
			if (!deleted) {
				res.sendStatus(404);
			} else res.sendStatus(204);
		},
		async acceptInvitation(req, res, next) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];

				const user = await securityService.getUserFromToken(token);
				const invitation = await Service.findOneById(req.params.id);

				if (!invitation) {
					return res.status(404).json({ message: "Invitation not found" });
				}

				if (!user._id === invitation.recipient.id) {
					return res.status(403).json({ message: "Unauthorized" });
				}

				await userService.addFriend(user._id, invitation.inviter.id);
				await userService.addFriend(invitation.inviter.id, user._id);

				await Service.deleteOne(req.params.id);

				res.status(200).json({ message: "Invitation accepted successfully" });
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
				const invitation = await Service.findOneById(req.params.id);

				if (!invitation) {
					return res.status(404).json({ message: "Invitation not found" });
				}

				if (!user._id === invitation.inviter.id) {
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
