module.exports = function (Service, options = {}) {
	return {
		async getAll(req, res) {
			const {
				_page = 1,
				_itemsPerPage = 30,
				// _sort[id]=ASC&_sort[name]=DESC
				_sort = {},
				...criteria
			} = req.query;

			const quizzs = await Service.findAll(criteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			res.json(quizzs);
		},
		async create(req, res, next) {
			try {
				const quizz = await Service.create(req.body);
				res.status(201).json(quizz);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const quizz = await Service.findOne(req.params.id);
			if (!quizz) {
				res.sendStatus(404);
			} else {
				res.json(quizz);
			}
		},
		async replace(req, res, next) {
			try {
				const [quizz, created] = await Service.replaceOne(
					parseInt(req.params.id, 10),
					req.body
				);

				if (!quizz) {
					res.sendStatus(404);
				} else res.status(created ? 201 : 200).json(quizz);
			} catch (error) {
				next(error);
			}
		},
		async update(req, res, next) {
			try {
				const quizz = await Service.updateOne(
					parseInt(req.params.id, 10),
					req.body
				);
				if (!quizz) {
					res.sendStatus(404);
				} else res.json(quizz);
			} catch (error) {
				next(error);
			}
		},
		async delete(req, res) {
			const deleted = await Service.deleteOne(parseInt(req.params.id, 10));
			if (!deleted) {
				res.sendStatus(404);
			} else res.sendStatus(204);
		},
	};
};
