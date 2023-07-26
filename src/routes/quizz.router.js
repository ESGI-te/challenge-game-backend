module.exports = (options = {}) => {
  const { Router } = require("express");
  const router = Router();
  const QuizzService = require("../services/quizz.service");
  const QuizzController = require("../controllers/quizz.controller");
  const controller = QuizzController(QuizzService());
  const authRole = require("../middlewares/authRole");

  router.get("/", controller.getAll);
  router.post("/", authRole("admin"), controller.create);

  router.get("/:id", controller.getOne);
  router.put("/:id", authRole("admin"), controller.replace);
  router.patch("/:id", authRole("admin"), controller.update);
  router.delete("/:id", authRole("admin"), controller.delete);

  return router;
};
