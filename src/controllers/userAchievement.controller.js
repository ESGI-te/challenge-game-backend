const SecurityService = require("../services/security.service");

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

			const achievements = await Service.findAll(criteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			res.json(achievements);
		},
		async getOne(req, res) {
			const token = req.headers["authorization"]?.split(" ")[1];
			const user = await securityService.getUserFromToken(token);
			const achievement = await Service.findOneByUser(user._id);
			if (!achievement) {
				res.sendStatus(404);
			} else {
				res.json(achievement);
			}
		},
	};
};
