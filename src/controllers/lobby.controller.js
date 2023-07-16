const SecurityService = require("../services/security.service");
const { generateUID } = require("../utils/helpers");

module.exports = (Service, options = {}) => {
	const securityService = SecurityService();

	return {
		async getAll(req, res) {
			const {
				_page = 1,
				_itemsPerPage = 30,
				// _sort[id]=ASC&_sort[name]=DESC
				_sort = {},
				...criteria
			} = req.query;

			const lobbies = await Service.findAll(criteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			res.json(lobbies);
		},
		async create(req, res, next) {
			try {
				const authHeader = req.headers.authorization;
				const token = authHeader.substring(7); // Remove Bearer from string
				const user = await securityService.getUserFromToken(token);
				const uid = generateUID();
				const data = { ...req.body, owner: user.id, invitation_code: uid };
				const lobby = await Service.create(data);
				res.status(201).json(lobby);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const lobby = await Service.findOne(req.params.id);
			if (!lobby) {
				res.sendStatus(404);
			} else {
				res.json(lobby);
			}
		},
		async getOneByCode(req, res) {
			const lobby = await Service.findOneByCode(req.params.code);
			if (!lobby) {
				res.sendStatus(404);
			} else {
				res.json(lobby);
			}
		},
		async update(req, res, next) {
			try {
				const lobby = await Service.updateOne(req.params.id, req.body);
				if (!lobby) {
					res.sendStatus(404);
				} else res.json(lobby);
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
