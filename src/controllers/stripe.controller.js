module.exports = (options = {}) => {
	const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

	return {
		async createCheckoutSession(req, res) {
			const items =
				[{
					price_data: {
						currency: 'eur',
						product_data: {
						  name: req.body.name,
						},
						unit_amount: req.body.price,
					  },
					  quantity: req.body.quantity,
				}];
			
			console.log(items);
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ["card"],
				line_items: items,
				mode: "payment",
				success_url: `${process.env.CLIENT_URL}/payment/success`,
				cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
			});

			res.json({ id: session.id });
		},
	};
};
