
const stripeConfig = require("../middlewares/stripe.config.js");
// const stripe = require("stripe")(stripeConfig.secretKey);
const stripe = require("stripe")("sk_test_51NOjgALtu9RUDD9GD6dtKhvv9wJX8dvtdEA8AucMAfAfaRYNDXzFek712umupnICgv6lSILZ7MVvW1juQf5Y8bJW00sy5KaC6H");



exports.processPayment = async (req, res) => {
  const { token } = req.body;

  try {
    // Créer une charge avec le token de carte et le montant du paiement
    const charge = await stripe.charges.create({
      amount: 1000, // Montant en centimes (ex: 10,00€)
      currency: "eur", // Devise du paiement
      source: token, // Token de carte créé côté client
      description: "Exemple de paiement", // Description du paiement (optionnel)
    });

    // Le paiement a été effectué avec succès
    console.log(charge);

    res.sendStatus(200);
  } catch (error) {
    // Gérer les erreurs lors du traitement du paiement
    console.error(error);
    res.sendStatus(500);
  }
};
