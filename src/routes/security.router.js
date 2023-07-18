module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const SecurityService = require("../services/security.service");
	const SecurityController = require("../controllers/security.controller");
	const controller = SecurityController(SecurityService());
	const authGuard = require("../middlewares/auth");

	router.post("/register", controller.register);
	router.post("/login", controller.login);
	router.get("/user", authGuard, controller.getUser);

	return router;
};
