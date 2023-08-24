module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const UserAchievementService = require("../services/userAchievement.service");
	const UserAchievementController = require("../controllers/userAchievement.controller");
	const controller = UserAchievementController(UserAchievementService());

	router.get("/", controller.getOne);

	return router;
};
