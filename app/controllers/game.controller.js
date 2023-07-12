const SecurityService = require("../services/security.service");
const LobbyService = require("../services/lobby.service");
const { generateUID } = require("../utils/helpers");

module.exports = function (Service, options = {}) {
	const securityService = new SecurityService();
	const lobbyService = new LobbyService();

	return {
		async getAll(req, res) {
			const {
				_page = 1,
				_itemsPerPage = 30,
				// _sort[id]=ASC&_sort[name]=DESC
				_sort = {},
				...criteria
			} = req.query;

			const games = await Service.findAll(criteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			res.json(games);
		},
		async create(req, res, next) {
			try {
				const authHeader = req.headers["authorization"];
				const token = authHeader && authHeader.split(" ")[1]; // Remove Bearer from string
				const user = await securityService.getUserFromToken(token);
				const uid = generateUID();
				const roomData = { owner: user.id, invitationCode: uid };
				const game = await Service.create({ ...req.body, ...roomData });
				const lobby = await lobbyService.create({
					...roomData,
					gameId: game.id,
					playersMax: req.body.playersMax,
				});
				res.status(201).json(lobby);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const game = await Service.findOne(req.params.id);
			if (!game) {
				res.sendStatus(404);
			} else {
				res.json(game);
			}
		},
		async update(req, res, next) {
			try {
				const game = await Service.updateOne(req.params.id, req.body);
				if (!game) {
					res.sendStatus(404);
				} else res.json(game);
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
