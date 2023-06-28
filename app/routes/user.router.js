module.exports = function (options = {}) {
	const { Router } = require("express");
	const router = Router();
	const UserService = require("../services/user.service");
	const UserController = require("../controllers/user.controller");
	const controller = new UserController(new UserService());

	router.get("/", controller.getAll);
	router.post("/", controller.create);

	router.get("/:id", controller.getOne);
	router.put("/:id", controller.replace);
	router.patch("/:id", controller.update);
	router.delete("/:id", controller.delete);

	return router;
};
