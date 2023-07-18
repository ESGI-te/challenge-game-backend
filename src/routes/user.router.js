module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const UserService = require("../services/user.service");
	const UserController = require("../controllers/user.controller");

	const userController = UserController(UserService());

	router.get("/", userController.getAll);
	router.post("/", userController.create);
	router.get("/friends", userController.getFriends);

	router.get("/:id", userController.getOne);
	router.put("/:id", userController.replace);
	router.patch("/:id", userController.update);
	router.delete("/:id", userController.delete);

	return router;
};
