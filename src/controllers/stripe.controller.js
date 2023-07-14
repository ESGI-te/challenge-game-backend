const StripeService = require('../services/stripeService');
module.exports = function (Service, options = {}) {
  return {
     async createPayment(req, res, next) {
      const { amount, source, description } = req.body;
  
      try {
        const paymentIntent = await StripeService.createPayment(amount, source, description);
  
        res.status(200).json({ paymentIntent });
      } catch (error) {
        next(error);
      };
    },
  };
};
