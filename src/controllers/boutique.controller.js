const stripe = require('stripe')(process.env.STRIPE_KEY_PRIVATE_KEY);
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

			const boutiqueItems = await Service.findAll(criteria, {
				itemsPerPage: _itemsPerPage,
				page: _page,
				order: _sort,
			});
			res.json(boutiqueItems);
		},
		async create(req, res, next) {
			try {
				const produit = await Service.create(req.body);
				res.status(201).json(produit);
			} catch (error) {
				next(error);
			}
		},
		async getOne(req, res) {
			const produit = await Service.findOne(parseInt(req.params.id, 10));
			if (!produit) {
				res.sendStatus(404);
			} else {
				res.json(produit);
			}
		},
		async replace(req, res, next) {
			try {
				const [produit, created] = await Service.replaceOne(
					parseInt(req.params.id, 10),
					req.body
				);

				if (!produit) {
					res.sendStatus(404);
				} else res.status(created ? 201 : 200).json(produit);
			} catch (error) {
				next(error);
			}
		},
		async update(req, res, next) {
			try {
				const produit = await Service.updateOne(
					parseInt(req.params.id, 10),
					req.body
				);
				if (!produit) {
					res.sendStatus(404);
				} else res.json(produit);
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
		async processPayment(req, res, next) {
			const { amount, source, description } = req.body;
	  
			try {
			  const paymentIntent = await stripe.paymentIntents.create({
				amount,
				currency: 'usd',
				payment_method_types: ['card'],
				payment_method: source,
				description,
			  });
	  
			  const clientSecret = paymentIntent.client_secret;
			  res.json({ clientSecret });
			} catch (error) {
			  next(error);
			}
		  },
	};
};
