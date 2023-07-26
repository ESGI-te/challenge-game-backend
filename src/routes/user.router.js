module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const UserService = require("../services/user.service");
	const UserController = require("../controllers/user.controller");
	const userController = UserController(UserService());
	const authRole = require("../middlewares/authRole");

	router.get("/",authRole("admin"), userController.getAll);
	router.post("/",authRole("admin"), userController.create);
	router.get("/friends", userController.getFriends);

	router.get("/:id", userController.getOne);
	router.put("/:id",authRole("admin"), userController.replace);
	router.patch("/:id",authRole("admin"), userController.update);
	router.delete("/:id",authRole("admin"), userController.delete);

	return router;
};
