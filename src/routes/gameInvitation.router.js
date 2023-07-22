module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const GameInvitationService = require("../services/gameInvitation.service");
	const GameInvitationController = require("../controllers/gameInvitation.controller");
	const controller = GameInvitationController(GameInvitationService());

	router.get("/", controller.getAll);
	router.post("/", controller.create);

	router.get("/:id", controller.getOne);

	router.post("/accept", controller.acceptInvitation);
	router.post("/decline", controller.declineInvitation);
	router.post("/cancel", controller.cancelInvitation);

	return router;
};
