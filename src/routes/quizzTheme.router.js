module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const QuizzThemeService = require("../services/quizzTheme.service");
	const QuizzThemeController = require("../controllers/quizzTheme.controller");
	const controller = QuizzThemeController(QuizzThemeService());

	router.get("/", controller.getAll);
	router.post("/", controller.create);

	router.get("/:id", controller.getOne);
	router.put("/:id", controller.replace);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	return router;
};
