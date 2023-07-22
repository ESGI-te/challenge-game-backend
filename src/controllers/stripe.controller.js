module.exports = (options = {}) => {
	const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
	const products = [
		{
			id: "test-product-id",
			name: "Test Product",
			description: "Test Product Description",
			price: 100,
			quantity: 1,
		},
	];
	return {
		async createCheckoutSession(req, res) {
			const items = req.body.products.map((id) => {
				const product = products.find((p) => p.id === id);
				return {
					price_data: {
						currency: "eur",
						product_data: {
							name: product.name,
						},
						unit_amount: product.price,
					},
					quantity: 1,
				};
			});
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
