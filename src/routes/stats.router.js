module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const HistoryService = require("../services/history.service");
	const StatsController = require("../controllers/stats.controller");
	const controller = StatsController(HistoryService());

	router.get('/average', controller.getAverage)

	return router;
};
