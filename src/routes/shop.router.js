module.exports = function (options = {}) {
	const { Router } = require("express");
	const router = Router();
	const StripeService = require("../services/stripe.service");
	const StripeController = require("../controllers/stripe.controller");
	const controller = new StripeController(new StripeService());

// 	router.get("/", controller.getAll);
// 	router.post("/", controller.create);

// 	router.get("/:id", controller.getOne);
// 	router.put("/:id", controller.replace);
// 	router.patch("/:id", controller.update);
// 	router.delete("/:id", controller.delete);

// 	return router;
// };

  
	// Autres routes spécifiques à votre boutique
  
	// Route pour créer un paiement avec Stripe
	router.post("/payment", stripeController.createPayment);
  
	// Route pour gérer les webhooks de Stripe
	router.post("/webhook", stripeController.handleWebhook);
  
	return router;
  };
  