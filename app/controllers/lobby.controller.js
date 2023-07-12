const SecurityService = require("../services/security.service");
const { generateUID } = require("../helpers");

module.exports = function (Service, options = {}) {
	const securityService = new SecurityService();

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
				const authHeader = req.headers.authorization;
				const token = authHeader.substring(7); // Remove Bearer from string
				const user = await securityService.getUserFromToken(token);
				const uid = generateUID();
				const data = { ...req.body, owner: user.id, invitation_code: uid };
				const game = await Service.create(data);
				res.status(201).json(game);
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
