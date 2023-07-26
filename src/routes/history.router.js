module.exports = (options = {}) => {
  const { Router } = require("express");
  const router = Router();
  const HistoryService = require("../services/history.service");
  const HistoryController = require("../controllers/history.controller");
  const controller = HistoryController(HistoryService());

  router.get("/", controller.getAll);
  router.get("/:id", controller.getOneEntry);
  router.get("/stats/last-entries", controller.getLastEntries);
  router.get("/stats/score", controller.getAverageScore);

  router.patch("/:id", controller.addHistoryEntry);

  router.patch("/:id", controller.addHistoryEntry);

  return router;
};
