// services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = function() {
  return {
    async createPayment(amount, source, description) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: 'eur',
          payment_method_types: ['card'],
          description,
          confirm: true,
          payment_method: source
        });
        return paymentIntent;
      } catch (error) {
        throw error;
      };
    },
  };
};