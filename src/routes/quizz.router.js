module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const QuizzService = require("../services/quizz.service");
	const QuizzController = require("../controllers/quizz.controller");
	const controller = QuizzController(QuizzService());

	router.get("/", controller.getAll);
	router.post("/", controller.create);

	router.get("/:id", controller.getOne);
	router.put("/:id", controller.replace);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	return router;
};
