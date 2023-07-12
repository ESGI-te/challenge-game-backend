module.exports = function (options = {}) {
	const { Router } = require("express");
	const router = Router();
	const UserInvitationService = require("../services/userInvitation.service");
	const UserInvitationController = require("../controllers/userInvitation.controller");
	const controller = new UserInvitationController(new UserInvitationService());

	router.get("/", controller.getAll);
	router.post("/", controller.create);

	router.get("/:id", controller.getOne);
	router.put("/:id", controller.replace);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	return router;
};
