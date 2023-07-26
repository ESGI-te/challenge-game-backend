module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
	const StripeController = require("../controllers/stripe.controller");
	const controller = StripeController();

	router.post("/checkout", controller.createCheckoutSession);
	router.get("/checkout/:id", controller.getSucces); // utiliser tripe	

	return router;
};
