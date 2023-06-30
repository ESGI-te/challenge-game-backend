// controllers/stripeController.js
const StripeService = require('../services/stripeService');

class StripeController {
  static async createPayment(req, res, next) {
    const { amount, source, description } = req.body;

    try {
      const paymentIntent = await StripeService.createPayment(amount, source, description);

      res.status(200).json({ paymentIntent });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StripeController;
