module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const SecurityService = require("../services/security.service");
	const SecurityController = require("../controllers/security.controller");
	const controller = SecurityController(SecurityService());

	router.post("/register", controller.register);
	router.post("/login", controller.login);

	return router;
};
