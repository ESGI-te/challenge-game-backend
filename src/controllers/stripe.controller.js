const InventoryService = require("../services/inventory.service");
const quizzThemePackService = require("../services/quizzThemePack.service");
const quizzThemeService = require("../services/quizzTheme.service");
const SecurityService = require("../services/security.service");
const ProductService = require("../services/shop.service");

module.exports = (options = {}) => {
	const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
	const inventoryService = InventoryService();
	const securityService = SecurityService();
	const packService = quizzThemePackService();
	const themeService = quizzThemeService();
	return {
		async createCheckoutSession(req, res) {
			try {
				const items = [
					{
						price_data: {
							currency: "eur",
							product_data: {
								name: req.body.product.name,
							},
							unit_amount: req.body.product.price,
						},
						quantity: req.body.product.quantity,
					},
				];

				const session = await stripe.checkout.sessions.create({
					payment_method_types: ["card"],
					line_items: items,
					mode: "payment",
					success_url: req.body.product.successUrl,
					cancel_url: req.body.product.cancelUrl,
				});

				// res.json({ id: session.id });
				res.json(session);
			} catch (error) {
				console.error(error);
				res.status(500).json({ message: "Internal server error" });
			}
		},
		async updateInventory(req, res) {
			//Récupération des 3 derniers achats
			const sessions = await stripe.checkout.sessions.list({ limit: 3 });
			// Récupération de la session réussi parmis les 3 derniers
			const sessionFind = sessions.data.find(
				(session) => session.id === req.query.session_id
			);
			// Récupération du produit vendu

			const getsession = await stripe.checkout.sessions
				.listLineItems(sessionFind.id, { limit: 5 })
				.then((lineItems) => {
					return lineItems;
				})
				.catch((error) => {
					throw error;
				});

			const token = req.headers["authorization"]?.split(" ")[1];
			const user = await securityService.getUserFromToken(token);

			const userInventory = await inventoryService.findOneByUser(user._id);

			const itemType = req.query.item_type;
			const itemName = getsession.data[0].description;

			const item =
				itemType === "themepack"
					? await packService.findOneByName(itemName)
					: await themeService.findOneByName(itemName);

			const newData =
				itemType === "themepack"
					? { theme_packs: item._id.toString(), themes: item.themes }
					: { themes: item._id.toString() };

			await inventoryService.updateOne(userInventory._id.toString(), newData);

			res.json(getsession.data);
		},
	};
};
