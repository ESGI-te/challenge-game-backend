const { USER_ROLES } = require("../utils/constants");

module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const UserService = require("../services/user.service");
	const UserController = require("../controllers/user.controller");
	const userController = UserController(UserService());
	const authRole = require("../middlewares/authRole");

	router.get("/", authRole(USER_ROLES.ADMIN), userController.getAll);
	router.post("/", authRole(USER_ROLES.ADMIN), userController.create);
	router.get("/friends", userController.getFriends);

	router.get("/:id", userController.getOne);
	router.put("/:id", authRole(USER_ROLES.ADMIN), userController.replace);
	router.patch("/:id", authRole(USER_ROLES.ADMIN), userController.update);
	router.delete("/:id", authRole(USER_ROLES.ADMIN), userController.delete);

	return router;
};
