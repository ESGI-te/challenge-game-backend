module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const HistoryService = require("../services/history.service");
	const HistoryController = require("../controllers/history.controller");
	const controller = HistoryController(HistoryService());

	router.get("/", controller.getAll);
	router.get("/last-entries", controller.getLastEntries);
	router.get("/:id", controller.getOneEntry);

	return router;
};
