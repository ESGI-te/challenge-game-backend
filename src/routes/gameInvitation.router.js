module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const GameInvitationService = require("../services/gameInvitation.service");
	const GameInvitationController = require("../controllers/gameInvitation.controller");
	const controller = GameInvitationController(GameInvitationService());

	router.get("/", controller.getAll);

	router.get("/:id", controller.getOne);

	router.post("/:id/accept", controller.acceptInvitation);
	router.post("/:id/decline", controller.declineInvitation);
	router.post("/:id/cancel", controller.cancelInvitation);

	return router;
};
