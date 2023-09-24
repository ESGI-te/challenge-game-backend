const { USER_ROLES } = require("../utils/constants");

module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const QuizzThemeService = require("../services/quizzTheme.service");
	const QuizzThemeController = require("../controllers/quizzTheme.controller");
	const controller = QuizzThemeController(QuizzThemeService());
	const authRole = require("../middlewares/authRole");

	router.get("/", controller.getAll);
	router.get("/public", controller.getAllPublic);

	router.post("/", controller.create);

	router.get("/:id", controller.getOne);
	router.put("/:id", authRole(USER_ROLES.ADMIN), controller.replace);
	router.patch("/:id", authRole(USER_ROLES.ADMIN), controller.update);
	router.delete("/:id", authRole(USER_ROLES.ADMIN), controller.delete);

	return router;
};
