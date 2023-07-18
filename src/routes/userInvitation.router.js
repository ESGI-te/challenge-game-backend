module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const UserInvitationService = require("../services/userInvitation.service");
	const UserInvitationController = require("../controllers/userInvitation.controller");
	const controller = UserInvitationController(UserInvitationService());

	router.get("/", controller.getAll);
	router.post("/", controller.create);

	router.get("/:id", controller.getOne);
	router.put("/:id", controller.replace);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	router.post("/:id/accept", controller.acceptInvitation);
	router.post("/:id/decline", controller.declineInvitation);
	router.post("/:id/cancel", controller.cancelInvitation);

	return router;
};
