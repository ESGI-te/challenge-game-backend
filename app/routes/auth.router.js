module.exports = function (options = {}) {
  const { Router } = require("express");
  const router = Router();
  const AuthService = require("../services/auth.service");
  const AuthController = require("../controllers/auth.controller");
  const controller = new AuthController(new AuthService());

  router.post("/register", controller.register);
  router.post("/login", controller.login);

  return router;
};
