module.exports = (options = {}) => {
	const { Router } = require("express");
	const router = Router();
    const stripeController = require("../controllers/stripe.controller");

	// Endpoint pour traiter le paiement
    router.post("/checkout", stripeController.processPayment);

    app.post('/boutique/payment', async (req, res) => {
        try {
          // Récupérer les informations de paiement du client depuis le front-end
          const { amount, currency, paymentMethodId } = req.body;
      
          // Créer le paiement avec Stripe
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: currency,
            payment_method: paymentMethodId,
            confirm: true,
          });
      
          // Envoyer la réponse au front-end
          res.status(200).json({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
          // Gérer les erreurs
          res.status(500).json({ error: error.message });
        }
      });
      app.post('/boutique/confirm-payment', async (req, res) => {
        try {
          // Récupérer le paiementIntentId depuis le front-end
          const { paymentIntentId } = req.body;
      
          // Confirmer le paiement avec Stripe
          const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      
          // Envoyer la réponse au front-end
          res.status(200).json({ success: true });
        } catch (error) {
          // Gérer les erreurs
          res.status(500).json({ error: error.message });
        }
      });
      

	return router;
};
