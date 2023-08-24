const { USER_ROLES } = require("../utils/constants");

module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const QuizzService = require("../services/quizz.service");
	const QuizzController = require("../controllers/quizz.controller");
	const controller = QuizzController(QuizzService());
	const authRole = require("../middlewares/authRole");

	router.get("/", controller.getAll);
	router.post("/", authRole(USER_ROLES.ADMIN), controller.create);

	router.get("/:id", controller.getOne);
	router.put("/:id", authRole(USER_ROLES.ADMIN), controller.replace);
	router.patch("/:id", authRole(USER_ROLES.ADMIN), controller.update);
	router.delete("/:id", authRole(USER_ROLES.ADMIN), controller.delete);

	return router;
};
