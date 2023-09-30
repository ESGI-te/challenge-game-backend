module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const GameService = require("../services/game.service");
	const GameController = require("../controllers/game.controller");
	const controller = GameController(GameService());

	router.get("/", controller.getAll);
	router.post("/", controller.create);

	router.get("/:code", controller.getOneByCode);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	return router;
};
