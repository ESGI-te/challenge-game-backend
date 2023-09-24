const SecurityService = require("../services/security.service");

module.exports = (Service, options = {}) => {
	const securityService = SecurityService();

	return {
		async getAll(req, res) {
			const token = req.headers["authorization"]?.split(" ")[1];
			const user = await securityService.getUserFromToken(token);
			const history = await Service.findOneByUser(user._id);
			if (!history) {
				res.sendStatus(404);
				return;
			}
			res.json(history);
		},
		async getOneEntry(req, res) {
			const token = req.headers["authorization"]?.split(" ")[1];
			const user = await securityService.getUserFromToken(token);
			const history = await Service.findOneByUser(user._id);
			if (!history) {
				res.sendStatus(404);
				return;
			}
			const gameStatsId = req.params.id;
			const historyEntry = await Service.findOneEntry(gameStatsId, user._id);
			if (!historyEntry) {
				res.sendStatus(404);
				return;
			}
			res.json(historyEntry);
		},
		async getLastEntries(req, res) {
			try {
				const token = req.headers["authorization"]?.split(" ")[1];
				const user = await securityService.getUserFromToken(token);
				const lastEntries = await Service.findLastEntries(user._id, 3);
				if (!lastEntries) {
					res.sendStatus(404);
					return;
				}

				res.json(lastEntries);
			} catch (error) {
				console.log(error);
				res.sendStatus(500);
			}
		},
	};
};
