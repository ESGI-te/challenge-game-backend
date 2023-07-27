module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const StripeController = require("../controllers/stripe.controller");
	const controller = StripeController();
	router.post("/checkout", controller.createCheckoutSession);
	router.post("/checkout/:id", controller.updateInventory);
	return router;
};
