module.exports = (Service, options = {}) => {
	return {
		async create(req, res, next) {
			try {
                
                const stats = [];
                const players = req.body.players;
                players.map(player => stats.push(player))
				const gameStats = await Service.create({stats});
				res.status(201).json(gameStats);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
            console.log(req.params);
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
	};
};
