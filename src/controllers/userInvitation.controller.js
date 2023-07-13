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

			const userInvitations = await Service.findAll(criteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			res.json(userInvitations);
		},
		async create(req, res, next) {
			try {
				const userInvitation = await Service.create(req.body);
				res.status(201).json(userInvitation);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const userInvitation = await Service.findOne(req.params.id);
			if (!userInvitation) {
				res.sendStatus(404);
			} else {
				res.json(userInvitation);
			}
		},
		async replace(req, res, next) {
			try {
				const [userInvitation, created] = await Service.replaceOne(
					req.params.id,
					req.body
				);

				if (!userInvitation) {
					res.sendStatus(404);
				} else res.status(created ? 201 : 200).json(userInvitation);
			} catch (error) {
				next(error);
			}
		},
		async update(req, res, next) {
			try {
				const userInvitation = await Service.updateOne(req.params.id, req.body);
				if (!userInvitation) {
					res.sendStatus(404);
				} else res.json(userInvitation);
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
