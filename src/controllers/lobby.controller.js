const SecurityService = require("../services/security.service");
const QuizzThemeService = require("../services/quizzTheme.service");
const { generateUID } = require("../utils/helpers");

module.exports = (Service, options = {}) => {
	const securityService = SecurityService();
	const quizzThemeService = QuizzThemeService();

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
				const authHeader = req.headers["authorization"];
				const token = authHeader && authHeader.split(" ")[1];
				const user = await securityService.getUserFromToken(token);
				const uid = generateUID();
				const themes = await quizzThemeService.findAll({}, { itemsPerPage: 2 });
				const data = {
					settings: req.body.settings,
					owner: user._id,
					invitation_code: uid,
					themes: themes.map((theme) => ({
						name: theme.name,
						id: theme._id,
					})),
				};
				const lobby = await Service.create(data);
				res.status(201).json({ code: lobby.invitation_code });
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
