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

			const criteriaByIds = req.query.ids;
			console.log(criteriaByIds);
			// const quizzThemes = await Service.findAll(criteria, {
			// 	itemsPerPage: _itemsPerPage,
			// 	page: _page,
			// 	order: _sort,
			// });
			// res.json(quizzThemes);
		},
		async create(req, res, next) {
			try {
				const quizzTheme = await Service.create(req.body);
				res.status(201).json(quizzTheme);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const quizzTheme = await Service.findOne(req.params.id);
			if (!quizzTheme) {
				res.sendStatus(404);
			} else {
				res.json(quizzTheme);
			}
		},
		async replace(req, res, next) {
			try {
				const [quizzTheme, created] = await Service.replaceOne(
					req.params.id,
					req.body
				);

				if (!quizzTheme) {
					res.sendStatus(404);
				} else res.status(created ? 201 : 200).json(quizzTheme);
			} catch (error) {
				next(error);
			}
		},
		async update(req, res, next) {
			try {
				const quizzTheme = await Service.updateOne(req.params.id, req.body);
				if (!quizzTheme) {
					res.sendStatus(404);
				} else res.json(quizzTheme);
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
