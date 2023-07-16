module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const LobbyService = require("../services/lobby.service");
	const LobbyController = require("../controllers/lobby.controller");
	const controller = LobbyController(LobbyService());

	router.get("/", controller.getAll);
	router.post("/", controller.create);

	router.get("/search/:code", controller.getOneByCode);
	router.get("/:id", controller.getOne);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	return router;
};
