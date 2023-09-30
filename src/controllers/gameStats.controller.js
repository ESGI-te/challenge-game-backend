const SecurityService = require("../services/security.service");
const HistoryService = require("../services/history.service");

module.exports = (Service, options = {}) => {
	const securityService = SecurityService();
	const historyService = HistoryService();

	return {
		async getOne(req, res) {
			const gameStats = await Service.findOneById(req.params.id);
			if (!gameStats) {
				res.sendStatus(404);
			} else {
				res.json(gameStats);
			}
		},
		async update(req, res, next) {
			try {
				const gameStats = await Service.updateOne(req.params.id, req.body);
				if (!gameStats) {
					res.sendStatus(404);
				} else res.json(gameStats);
			} catch (error) {
				next(error);
			}
		},
		async delete(req, res) {
			const deleted = await Service.deleteOne(req.params.id);
			if (!deleted) {
				res.sendStatus(404);
			} else res.sendStatus(204);
		},
		async getOneByCode(req, res) {
			const game = await Service.findOneByCode(req.params.code);
			if (!game) {
				res.sendStatus(404);
			} else {
				res.json(game);
			}
		},
		async getAverage(req, res) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];
				const user = await securityService.getUserFromToken(token);
				const days = req.query.days;
				const avgScore = await historyService.getStatsWithAverage(
					user._id,
					days
				);
				if (!avgScore) {
					res.sendStatus(404);
					return;
				}
				res.json(avgScore);
			} catch (error) {
				console.log(error);
				res.sendStatus(500);
			}
		},
	};
};
