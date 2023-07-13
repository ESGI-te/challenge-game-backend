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

			const users = await Service.findAll(criteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			res.json(users);
		},
		async create(req, res, next) {
			try {
				const user = await Service.create(req.body);
				res.status(201).json(user);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const user = await Service.findOne(req.params.id);
			if (!user) {
				res.sendStatus(404);
			} else {
				res.json(user);
			}
		},
		async replace(req, res, next) {
			try {
				const [user, created] = await Service.replaceOne(
					req.params.id,
					req.body
				);

				if (!user) {
					res.sendStatus(404);
				} else res.status(created ? 201 : 200).json(user);
			} catch (error) {
				next(error);
			}
		},
		async update(req, res, next) {
			try {
				const user = await Service.updateOne(req.params.id, req.body);
				if (!user) {
					res.sendStatus(404);
				} else res.json(user);
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
