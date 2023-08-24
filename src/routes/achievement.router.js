const { USER_ROLES } = require("../utils/constants");

module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const AchievementService = require("../services/achievement.service");
	const AchievementController = require("../controllers/achievement.controller");
	const controller = AchievementController(AchievementService());
	const authRole = require("../middlewares/authRole");

	router.get("/", controller.getAll);
	router.post("/", authRole(USER_ROLES.ADMIN), controller.create);

	router.get("/:id", controller.getOne);
	router.put("/:id", authRole(USER_ROLES.ADMIN), controller.replace);
	router.patch("/:id", authRole(USER_ROLES.ADMIN), controller.update);
	router.delete("/:id", authRole(USER_ROLES.ADMIN), controller.delete);

	return router;
};
