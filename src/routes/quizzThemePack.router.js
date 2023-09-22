module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const ThemePackService = require("../services/quizzThemePack.service");
	const ThemePackController = require("../controllers/quizzThemePack.controller");
	const controller = ThemePackController(ThemePackService());
	const authRole = require("../middlewares/authRole");

	router.get("/", controller.getAll);
	// router.post("/", authRole(USER_ROLES.ADMIN), controller.create);
	router.post("/", controller.create);


	router.get("/:id", controller.getOne);
	// router.put("/:id", authRole(USER_ROLES.ADMIN), controller.replace);
	// router.patch("/:id", authRole(USER_ROLES.ADMIN), controller.update);
	// router.delete("/:id", authRole(USER_ROLES.ADMIN), controller.delete);

    // router.put("/:id", controller.replace);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	return router;
};