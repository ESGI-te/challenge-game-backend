module.exports = (Service, options = {}) => {
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
		async create(req, res, next) {
			try {
				const achievement = await Service.create(req.body);
				res.status(201).json(achievement);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const achievement = await Service.findOnebyId(req.params.id);
			if (!achievement) {
				res.sendStatus(404);
			} else {
				res.json(achievement);
			}
		},
		async replace(req, res, next) {
			try {
				const [achievement, created] = await Service.replaceOne(
					req.params.id,
					req.body
				);

				if (!achievement) {
					res.sendStatus(404);
				} else res.status(created ? 201 : 200).json(achievement);
			} catch (error) {
				next(error);
			}
		},
		async update(req, res, next) {
			try {
				const achievement = await Service.updateOne(req.params.id, req.body);
				if (!achievement) {
					res.sendStatus(404);
				} else res.json(achievement);
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
